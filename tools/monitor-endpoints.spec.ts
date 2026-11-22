import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_TARGETS,
  parseArgs,
  probeOnce,
  probeWithRetries,
  runMonitor,
  sendMonitorDiscordAlert,
} from "./monitor-endpoints.mjs";

describe("monitor-endpoints", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes nunziellasalluce.com and all three moustachedesign WordPress domains", () => {
    const urls = DEFAULT_TARGETS.map((t) => t.url);
    expect(urls).toContain("https://nunziellasalluce.com/health.json");
    expect(
      urls.some((u) => u.startsWith("https://nunziella.moustachedesign.fyi/")),
    ).toBe(true);
    expect(
      urls.some((u) => u.startsWith("https://bike.moustachedesign.fyi/")),
    ).toBe(true);
    expect(
      urls.some((u) => u.startsWith("https://api.moustachedesign.fyi/")),
    ).toBe(true);
  });

  it("parses CLI flags cleanly and rejects --timeout-ms 0", () => {
    expect(
      parseArgs([
        "--timeout-ms",
        "5000",
        "--retries",
        "2",
        "--retry-delay-ms",
        "100",
        "--json",
        "--dry-run",
        "--fail-on-slow",
      ]),
    ).toEqual({
      timeoutMs: 5000,
      retries: 2,
      retryDelayMs: 100,
      json: true,
      dryRun: true,
      failOnSlow: true,
    });

    expect(parseArgs(["--timeout-ms", "0"]).timeoutMs).toBe(10_000);
  });

  it("falls back to workers.dev when Cloudflare returns a 403 challenge", async () => {
    const healthTarget = DEFAULT_TARGETS.find(
      (t) => t.id === "nunziellasalluce-health",
    )!;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("<!DOCTYPE html><title>Just a moment...</title>", {
          status: 403,
          headers: { "cf-mitigated": "challenge" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, status: "healthy" }), {
          status: 200,
        }),
      );

    const res = await probeOnce(healthTarget, { fetchImpl: fetchMock });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe("ok");
    expect(res.fallbackUsed).toBe(true);
    expect(res.url).toBe(healthTarget.fallbackUrl);
  });

  it("marks healthy, slow, and down endpoints accurately", async () => {
    let ticks = 0;
    const now = () => {
      ticks += 250;
      return ticks;
    };

    const fastTarget = {
      id: "fast",
      name: "Fast WP",
      url: "https://api.moustachedesign.fyi/wp-json/",
      latencyThresholdMs: 1000,
      validateJson: (d: { namespaces?: unknown[] }) =>
        Array.isArray(d?.namespaces) ? null : "Missing namespaces",
    };

    const okResult = await probeOnce(fastTarget, {
      now,
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ namespaces: ["wp/v2"] }), {
          status: 200,
        }),
      ),
    });
    expect(okResult.status).toBe("ok");
    expect(okResult.latencyMs).toBe(250);

    const slowTarget = { ...fastTarget, latencyThresholdMs: 100 };
    const slowResult = await probeOnce(slowTarget, {
      now,
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ namespaces: ["wp/v2"] }), {
          status: 200,
        }),
      ),
    });
    expect(slowResult.status).toBe("slow");
    expect(slowResult.error).toContain("exceeded 100ms");

    const invalidSchemaResult = await probeOnce(fastTarget, {
      now,
      fetchImpl: vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })),
    });
    expect(invalidSchemaResult.status).toBe("down");
    expect(invalidSchemaResult.error).toBe("Missing namespaces");

    const httpErrorResult = await probeOnce(fastTarget, {
      now,
      fetchImpl: vi
        .fn()
        .mockResolvedValue(
          new Response("Service Unavailable", { status: 503 }),
        ),
    });
    expect(httpErrorResult.status).toBe("down");
    expect(httpErrorResult.httpStatus).toBe(503);
  });

  it("retries transient failures before marking ok or down", async () => {
    const target = {
      id: "wp",
      name: "Bike WP",
      url: "https://bike.moustachedesign.fyi/wp-json/",
      latencyThresholdMs: 5000,
      validateJson: () => null,
    };

    const fetchRecover = vi
      .fn()
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const recovered = await probeWithRetries(target, {
      retries: 1,
      retryDelayMs: 0,
      fetchImpl: fetchRecover,
    });
    expect(recovered.status).toBe("ok");
    expect(recovered.attempts).toBe(2);

    const fetchDown = vi.fn().mockRejectedValue(new Error("ETIMEDOUT"));
    const down = await probeWithRetries(target, {
      retries: 1,
      retryDelayMs: 0,
      fetchImpl: fetchDown,
    });
    expect(down.status).toBe("down");
    expect(down.attempts).toBe(2);
    expect(down.error).toBe("ETIMEDOUT");
  });

  it("dispatches a Discord alert when targets are slow or down unless --dry-run", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.example/uptime");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Error", { status: 502 }))
      .mockResolvedValueOnce(new Response("Error", { status: 502 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const report = await runMonitor({
      targets: [
        {
          id: "down-site",
          name: "Down Site",
          url: "https://bike.moustachedesign.fyi/wp-json/",
          latencyThresholdMs: 5000,
          validateJson: () => null,
        },
      ],
      options: {
        timeoutMs: 2000,
        retries: 1,
        retryDelayMs: 0,
        json: false,
        dryRun: false,
        failOnSlow: false,
      },
      fetchImpl: fetchMock,
    });

    expect(report.ok).toBe(false);
    expect(report.alertSent).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const body = String(fetchMock.mock.calls[2][1]?.body || "");
    expect(body).toContain("Uptime Alert");
    expect(body).toContain("bike.moustachedesign.fyi");
  });

  it("does not call Discord when all targets are ok or webhook is unset", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "");
    const sent = await sendMonitorDiscordAlert([
      {
        id: "ok",
        name: "OK",
        url: "https://nunziellasalluce.com/health.json",
        status: "ok",
        httpStatus: 200,
        latencyMs: 120,
        thresholdMs: 3000,
        attempts: 1,
        error: null,
      },
    ]);
    expect(sent).toBe(false);
  });
});
