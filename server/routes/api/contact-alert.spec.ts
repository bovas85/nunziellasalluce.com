import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import alertHandler from "./contact-alert.post";

let mockBody: unknown = {};
let responseStatus: number | undefined;

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readBody: vi.fn(async () => mockBody),
    setResponseStatus: vi.fn((_event: H3Event, status: number) => {
      responseStatus = status;
    }),
  };
});

describe("POST /api/contact-alert", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DISCORD_WEBHOOK_URL = "https://discord.example/webhook";
    mockBody = {};
    responseStatus = undefined;
  });

  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns 400 when alert kind is missing or invalid, or latencyMs is non-positive", async () => {
    mockBody = { kind: "other" };
    const res = await alertHandler({} as H3Event);

    expect(responseStatus).toBe(400);
    expect(res).toEqual({
      ok: false,
      error: "Invalid alert kind. Expected 'error' or 'latency'.",
    });

    responseStatus = undefined;
    mockBody = { kind: "latency", latencyMs: 0 };
    const latencyRes = await alertHandler({} as H3Event);
    expect(responseStatus).toBe(400);
    expect(latencyRes).toEqual({
      ok: false,
      error: "Latency alerts require a positive latencyMs value.",
    });
  });

  it("sanitizes unknown cf7Status values to unknown and sets allowed_mentions", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as typeof fetch;

    mockBody = {
      kind: "error",
      cf7Status: "@everyone malicious",
      latencyMs: 120,
    };

    const res = await alertHandler({} as H3Event);
    expect(res).toEqual({ ok: true });
    const body = String(fetchMock.mock.calls[0][1]?.body || "");
    expect(body).toContain("Contact Form Error (unknown)");
    expect(body).toContain('"allowed_mentions":{"parse":[]}');
    expect(body).not.toContain("malicious");
  });

  it("dispatches a Discord error alert via Cloudflare waitUntil for CF7 spam/mail_failed", async () => {
    const waitUntilMock = vi.fn((promise: Promise<unknown>) => promise);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as typeof fetch;

    mockBody = {
      kind: "error",
      cf7Status: "spam",
      httpStatus: 200,
      latencyMs: 420,
      detail: "There was an error trying to send your message.",
    };

    const mockEvent = {
      context: {
        cloudflare: {
          env: { DISCORD_WEBHOOK_URL: "https://discord.example/cf-webhook" },
          context: { waitUntil: waitUntilMock },
        },
      },
    } as unknown as H3Event;

    const res = await alertHandler(mockEvent);
    expect(res).toEqual({ ok: true });
    expect(waitUntilMock).toHaveBeenCalledTimes(1);
    await waitUntilMock.mock.calls[0][0];

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://discord.example/cf-webhook",
    );
    const body = String(fetchMock.mock.calls[0][1]?.body || "");
    expect(body).toContain("Contact Form Error (spam)");
    expect(body).toContain("420ms");
  });

  it("dispatches a Discord warning embed for latency spikes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as typeof fetch;

    mockBody = {
      kind: "latency",
      cf7Status: "mail_sent",
      httpStatus: 200,
      latencyMs: 6400,
    };

    const res = await alertHandler({} as H3Event);
    expect(res).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = String(fetchMock.mock.calls[0][1]?.body || "");
    expect(body).toContain("Contact Form Latency Spike (6400ms)");
  });
});
