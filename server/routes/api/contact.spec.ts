import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import contactHandler, { CONTACT_UPSTREAM_URL } from "./contact.post";

let mockFormData: FormData | Error = new FormData();
let responseStatus: number | undefined;

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readFormData: vi.fn(async () => {
      if (mockFormData instanceof Error) {
        throw mockFormData;
      }
      return mockFormData;
    }),
    setResponseStatus: vi.fn((_event: H3Event, status: number) => {
      responseStatus = status;
    }),
  };
});

describe("POST /api/contact", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DISCORD_WEBHOOK_URL = "https://discord.example/webhook";
    responseStatus = undefined;
    mockFormData = new FormData();
    mockFormData.append("your-name", "Jane Doe");
    mockFormData.append("your-email", "jane@example.com");
    mockFormData.append("your-message", "Secret inquiry body");
  });

  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns 400 when request body cannot be parsed as FormData", async () => {
    mockFormData = new Error("bad form data");
    const res = await contactHandler({} as H3Event);

    expect(responseStatus).toBe(400);
    expect(res).toEqual({
      status: "validation_failed",
      message: "Invalid contact form payload.",
    });
  });

  it("forwards valid submissions and sends no alert on normal mail_sent", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: "mail_sent",
          message: "Thank you for your message.",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const res = await contactHandler({} as H3Event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(CONTACT_UPSTREAM_URL);
    expect(responseStatus).toBeUndefined();
    expect(res).toEqual({
      status: "mail_sent",
      message: "Thank you for your message.",
    });
  });

  it("does not send a Discord alert for validation_failed or spam responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "validation_failed",
            message: "One or more fields have an error.",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "spam",
            message: "Spam detected.",
          }),
          { status: 200 },
        ),
      );
    globalThis.fetch = fetchMock as typeof fetch;

    const validationRes = await contactHandler({} as H3Event);
    const spamRes = await contactHandler({} as H3Event);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(validationRes).toMatchObject({ status: "validation_failed" });
    expect(spamRes).toMatchObject({ status: "spam" });
  });

  it("sends a Discord alert without PII when Contact Form 7 returns mail_failed", async () => {
    const waitUntilMock = vi.fn((promise: Promise<unknown>) => promise);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "mail_failed",
            message: "SMTP delivery failed",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const mockEvent = {
      context: {
        cloudflare: {
          env: { DISCORD_WEBHOOK_URL: "https://discord.example/cf-webhook" },
          context: { waitUntil: waitUntilMock },
        },
      },
    } as unknown as H3Event;

    const res = await contactHandler(mockEvent);
    expect(res).toEqual({
      status: "mail_failed",
      message: "SMTP delivery failed",
    });

    expect(waitUntilMock).toHaveBeenCalledTimes(1);
    await waitUntilMock.mock.calls[0][0];

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://discord.example/cf-webhook",
    );
    const webhookBody = String(fetchMock.mock.calls[1][1]?.body || "");
    expect(webhookBody).toContain("mail_failed");
    expect(webhookBody).not.toContain("Jane Doe");
    expect(webhookBody).not.toContain("jane@example.com");
    expect(webhookBody).not.toContain("Secret inquiry body");
  });

  it("sends a Discord latency spike alert when upstream exceeds threshold", async () => {
    process.env.CONTACT_LATENCY_THRESHOLD_MS = "10";
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1250);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "mail_sent" }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const res = await contactHandler({} as H3Event);

    expect(res).toEqual({ status: "mail_sent" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const webhookBody = String(fetchMock.mock.calls[1][1]?.body || "");
    expect(webhookBody).toContain("Latency Spike");
    expect(webhookBody).toContain("250ms");
  });

  it("alerts and returns 502 when upstream fetch rejects", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("connect ETIMEDOUT"))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const res = await contactHandler({} as H3Event);

    expect(responseStatus).toBe(502);
    expect(res).toEqual({
      status: "mail_failed",
      message: "Unable to reach the contact form service.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const webhookBody = String(fetchMock.mock.calls[1][1]?.body || "");
    expect(webhookBody).toContain("Upstream Error");
    expect(webhookBody).toContain("ETIMEDOUT");
  });

  it("alerts and preserves upstream status on non-2xx HTTP responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("Bad Gateway", { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const res = await contactHandler({} as H3Event);

    expect(responseStatus).toBe(503);
    expect(res).toEqual({
      status: "mail_failed",
      message: "Contact form upstream returned an invalid response.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const webhookBody = String(fetchMock.mock.calls[1][1]?.body || "");
    expect(webhookBody).toContain("HTTP 503");
  });
});
