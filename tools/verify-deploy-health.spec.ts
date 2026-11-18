import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_USER_AGENT,
  fetchHealth,
  isCloudflareChallenge,
  parseArgs,
  verifyDeployHealth,
} from "./verify-deploy-health.mjs";

describe("verify-deploy-health", () => {
  it("parses --url, --fallback-url, --expected-sha, --timeout, and --poll-interval", () => {
    const parsed = parseArgs([
      "--url",
      "https://nunziellasalluce.com/",
      "--fallback-url",
      "https://worker.nunziellasalluce.workers.dev/",
      "--expected-sha",
      "abc1234",
      "--timeout",
      "45",
      "--poll-interval",
      "2",
    ]);

    expect(parsed).toEqual({
      url: "https://nunziellasalluce.com",
      fallbackUrl: "https://worker.nunziellasalluce.workers.dev",
      expectedSha: "abc1234",
      timeoutSeconds: 45,
      pollIntervalSeconds: 2,
    });
  });

  it("detects Cloudflare challenge responses from cf-mitigated header or challenge HTML", () => {
    const headerChallenge = {
      status: 403,
      headers: new Headers({ "cf-mitigated": "challenge" }),
    };
    expect(isCloudflareChallenge(headerChallenge, "")).toBe(true);

    const htmlChallenge = {
      status: 403,
      headers: new Headers(),
    };
    expect(
      isCloudflareChallenge(
        htmlChallenge,
        "<!DOCTYPE html><html><head><title>Just a moment...</title></head></html>",
      ),
    ).toBe(true);

    const plainForbidden = {
      status: 403,
      headers: new Headers(),
    };
    expect(isCloudflareChallenge(plainForbidden, "Access denied")).toBe(false);
    expect(
      isCloudflareChallenge({ status: 404, headers: new Headers() }, ""),
    ).toBe(false);
  });

  it("sends explicit User-Agent and flags cfChallenge on 403 challenge responses", async () => {
    const fetchMock = vi.fn(async (_url, init) => {
      expect(init.headers["User-Agent"]).toBe(DEFAULT_USER_AGENT);
      expect(init.headers.Accept).toBe("application/json");
      return new Response("<html><title>Just a moment...</title></html>", {
        status: 403,
        statusText: "Forbidden",
        headers: { "cf-mitigated": "challenge" },
      });
    });

    const result = await fetchHealth("https://nunziellasalluce.com", fetchMock);
    expect(result).toEqual({
      ok: false,
      status: 403,
      cfChallenge: true,
      error: "HTTP 403 Forbidden (cf-mitigated: challenge)",
    });
  });

  it("falls back to Worker URL when primary URL is blocked by Cloudflare challenge", async () => {
    const probedUrls = [];
    const fetchHealthMock = vi.fn(async (url) => {
      probedUrls.push(url);
      if (url === "https://nunziellasalluce.com") {
        return {
          ok: false,
          status: 403,
          cfChallenge: true,
          error: "HTTP 403 Forbidden (cf-mitigated: challenge)",
        };
      }
      return {
        ok: true,
        data: {
          ok: true,
          status: "healthy",
          commitSha: "69e116dd44ee4f25bda3038a1a37e02072ffa1e1",
          commit: { message: "Build deployment" },
          deploy: {
            environment: "prerender",
            deployedAt: "2026-11-18T12:06:51.609Z",
          },
        },
      };
    });
    const notifyMock = vi.fn(async () => {});
    const sleepMock = vi.fn(async () => {});

    const outcome = await verifyDeployHealth(
      {
        url: "https://nunziellasalluce.com",
        fallbackUrl:
          "https://nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu.nunziellasalluce.workers.dev",
        expectedSha: "69e116dd44ee4f25bda3038a1a37e02072ffa1e1",
        timeoutSeconds: 10,
        pollIntervalSeconds: 5,
      },
      {
        fetchHealth: fetchHealthMock,
        sendDiscordNotification: notifyMock,
        sleep: sleepMock,
      },
    );

    expect(outcome.ok).toBe(true);
    expect(outcome.usedFallback).toBe(true);
    expect(outcome.url).toBe(
      "https://nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu.nunziellasalluce.workers.dev",
    );
    expect(probedUrls).toEqual([
      "https://nunziellasalluce.com",
      "https://nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu.nunziellasalluce.workers.dev",
    ]);
    expect(sleepMock).not.toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });

  it("does not fall back on non-challenge HTTP errors such as 404 or 500", async () => {
    const probedUrls = [];
    let calls = 0;
    const fetchHealthMock = vi.fn(async (url) => {
      probedUrls.push(url);
      calls += 1;
      if (calls >= 2) {
        return {
          ok: false,
          status: 500,
          cfChallenge: false,
          error: "HTTP 500 Internal Server Error",
        };
      }
      return {
        ok: false,
        status: 404,
        cfChallenge: false,
        error: "HTTP 404 Not Found",
      };
    });
    const notifyMock = vi.fn(async () => {});
    const sleepMock = vi.fn(async () => {});

    const outcome = await verifyDeployHealth(
      {
        url: "https://nunziellasalluce.com",
        fallbackUrl:
          "https://nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu.nunziellasalluce.workers.dev",
        expectedSha: "69e116dd44ee4f25bda3038a1a37e02072ffa1e1",
        timeoutSeconds: 0.05,
        pollIntervalSeconds: 0.03,
      },
      {
        fetchHealth: fetchHealthMock,
        sendDiscordNotification: notifyMock,
        sleep: async (ms) => {
          await sleepMock(ms);
          await new Promise((resolve) => setTimeout(resolve, ms));
        },
      },
    );

    expect(outcome.ok).toBe(false);
    expect(outcome.usedFallback).toBe(false);
    expect(
      probedUrls.every((url) => url === "https://nunziellasalluce.com"),
    ).toBe(true);
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });
});
