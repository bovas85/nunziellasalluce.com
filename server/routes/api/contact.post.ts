import { defineEventHandler, readFormData, setResponseStatus } from "h3";
import {
  getDiscordWebhookUrl,
  scheduleBackgroundTask,
  sendDiscordAlert,
} from "../../utils/alerts";

export const CONTACT_UPSTREAM_URL =
  "https://nunziella.moustachedesign.fyi/wp-json/contact-form-7/v1/contact-forms/78/feedback";

export const DEFAULT_CONTACT_TIMEOUT_MS = 15_000;
export const DEFAULT_CONTACT_LATENCY_THRESHOLD_MS = 5_000;

interface ContactUpstreamPayload {
  status?: string;
  message?: string;
  code?: string;
  [key: string]: unknown;
}

function parsePositiveInt(raw: unknown, fallback: number): number {
  if (typeof raw !== "string" && typeof raw !== "number") return fallback;
  const parsed = Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default defineEventHandler(async (event) => {
  let formData: FormData;
  try {
    formData = await readFormData(event);
  } catch {
    setResponseStatus(event, 400);
    return {
      status: "validation_failed",
      message: "Invalid contact form payload.",
    };
  }

  const cfEnv = (
    event.context as { cloudflare?: { env?: Record<string, unknown> } }
  )?.cloudflare?.env;
  const timeoutMs = parsePositiveInt(
    cfEnv?.CONTACT_UPSTREAM_TIMEOUT_MS ??
      process.env.CONTACT_UPSTREAM_TIMEOUT_MS,
    DEFAULT_CONTACT_TIMEOUT_MS,
  );
  const latencyThresholdMs = parsePositiveInt(
    cfEnv?.CONTACT_LATENCY_THRESHOLD_MS ??
      process.env.CONTACT_LATENCY_THRESHOLD_MS,
    DEFAULT_CONTACT_LATENCY_THRESHOLD_MS,
  );
  const webhookUrl = getDiscordWebhookUrl(event);
  const startedAt = Date.now();

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(CONTACT_UPSTREAM_URL, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const errorMessage = err instanceof Error ? err.message : String(err);

    await scheduleBackgroundTask(
      event,
      sendDiscordAlert({
        webhookUrl,
        title: "🚨 Contact Form Upstream Error",
        description:
          "Submitting `/api/contact` failed to reach WordPress Contact Form 7.",
        color: 0xef4444,
        fields: [
          { name: "Endpoint", value: CONTACT_UPSTREAM_URL },
          { name: "Latency", value: `${latencyMs}ms`, inline: true },
          { name: "Error", value: errorMessage.slice(0, 500) },
        ],
      }),
    );

    setResponseStatus(event, 502);
    return {
      status: "mail_failed",
      message: "Unable to reach the contact form service.",
    };
  }

  const latencyMs = Date.now() - startedAt;
  const rawBody = await upstreamResponse.text();

  let parsedPayload: ContactUpstreamPayload | null = null;
  try {
    const candidate: unknown = JSON.parse(rawBody);
    if (
      candidate !== null &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      parsedPayload = candidate as ContactUpstreamPayload;
    }
  } catch {
    parsedPayload = null;
  }

  if (!upstreamResponse.ok || !parsedPayload) {
    const statusCode = upstreamResponse.ok ? 502 : upstreamResponse.status;
    await scheduleBackgroundTask(
      event,
      sendDiscordAlert({
        webhookUrl,
        title: `🚨 Contact Form HTTP ${upstreamResponse.status}`,
        description: parsedPayload
          ? "WordPress Contact Form 7 returned a non-success HTTP status."
          : "WordPress Contact Form 7 returned an invalid JSON response.",
        color: 0xef4444,
        fields: [
          {
            name: "HTTP Status",
            value: String(upstreamResponse.status),
            inline: true,
          },
          { name: "Latency", value: `${latencyMs}ms`, inline: true },
          {
            name: "CF7 Status",
            value: String(parsedPayload?.status || "invalid_json"),
            inline: true,
          },
          {
            name: "Details",
            value: String(
              parsedPayload?.message || rawBody.slice(0, 300) || "Empty body",
            ),
          },
        ],
      }),
    );

    setResponseStatus(event, statusCode);
    return (
      parsedPayload || {
        status: "mail_failed",
        message: "Contact form upstream returned an invalid response.",
      }
    );
  }

  const cf7Status =
    typeof parsedPayload.status === "string" ? parsedPayload.status : "";

  if (
    cf7Status !== "mail_sent" &&
    cf7Status !== "validation_failed" &&
    cf7Status !== "spam"
  ) {
    await scheduleBackgroundTask(
      event,
      sendDiscordAlert({
        webhookUrl,
        title: `🚨 Contact Form Failure (${cf7Status || "missing_status"})`,
        description:
          "WordPress Contact Form 7 failed to deliver a valid contact inquiry.",
        color: 0xef4444,
        fields: [
          {
            name: "CF7 Status",
            value: cf7Status || "missing_status",
            inline: true,
          },
          { name: "Latency", value: `${latencyMs}ms`, inline: true },
          {
            name: "Message",
            value: String(parsedPayload.message || "No message provided"),
          },
        ],
      }),
    );
  } else if (latencyMs > latencyThresholdMs) {
    await scheduleBackgroundTask(
      event,
      sendDiscordAlert({
        webhookUrl,
        title: `⚠️ Contact Form Latency Spike (${latencyMs}ms)`,
        description: `Contact form upstream exceeded ${latencyThresholdMs}ms threshold.`,
        color: 0xf59e0b,
        fields: [
          { name: "CF7 Status", value: cf7Status, inline: true },
          { name: "Latency", value: `${latencyMs}ms`, inline: true },
          {
            name: "Threshold",
            value: `${latencyThresholdMs}ms`,
            inline: true,
          },
        ],
      }),
    );
  }

  return parsedPayload;
});
