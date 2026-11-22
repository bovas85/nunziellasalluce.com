import { defineEventHandler, readBody, setResponseStatus } from "h3";
import {
  getDiscordWebhookUrl,
  scheduleBackgroundTask,
  sendDiscordAlert,
} from "../../utils/alerts";

export interface ContactAlertBody {
  kind?: unknown;
  cf7Status?: unknown;
  httpStatus?: unknown;
  latencyMs?: unknown;
  detail?: unknown;
}

const ALLOWED_CF7_STATUSES = new Set([
  "mail_sent",
  "mail_failed",
  "spam",
  "aborted",
  "acceptance_missing",
  "missing_status",
  "network_or_http_error",
  "unknown",
]);

function sanitizeCf7Status(value: unknown): string {
  if (typeof value !== "string") return "unknown";
  const normalized = value.trim().toLowerCase();
  return ALLOWED_CF7_STATUSES.has(normalized) ? normalized : "unknown";
}

function sanitizeText(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLen) : undefined;
}

function sanitizeNonNegativeInt(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return Math.round(value);
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactAlertBody>(event).catch(() => null);
  const kind = body?.kind;

  if (kind !== "error" && kind !== "latency") {
    setResponseStatus(event, 400);
    return {
      ok: false,
      error: "Invalid alert kind. Expected 'error' or 'latency'.",
    };
  }

  const cf7Status = sanitizeCf7Status(body?.cf7Status);
  const httpStatus = sanitizeNonNegativeInt(body?.httpStatus);
  const latencyMs = sanitizeNonNegativeInt(body?.latencyMs);
  const detail = sanitizeText(body?.detail, 300);

  if (kind === "latency" && (latencyMs === undefined || latencyMs <= 0)) {
    setResponseStatus(event, 400);
    return {
      ok: false,
      error: "Latency alerts require a positive latencyMs value.",
    };
  }

  const webhookUrl = getDiscordWebhookUrl(event);
  const isLatency = kind === "latency";

  const fields = [
    { name: "CF7 Status", value: cf7Status, inline: true },
    ...(httpStatus !== undefined
      ? [{ name: "HTTP Status", value: String(httpStatus), inline: true }]
      : []),
    ...(latencyMs !== undefined
      ? [{ name: "Latency", value: `${latencyMs}ms`, inline: true }]
      : []),
    ...(detail ? [{ name: "Detail", value: detail }] : []),
  ];

  await scheduleBackgroundTask(
    event,
    sendDiscordAlert({
      webhookUrl,
      title: isLatency
        ? `⚠️ Contact Form Latency Spike (${latencyMs ?? "?"}ms)`
        : `🚨 Contact Form Error (${cf7Status})`,
      description: isLatency
        ? "Client contact form submission exceeded the latency threshold."
        : "Client contact form submission to WordPress Contact Form 7 failed.",
      color: isLatency ? 0xf59e0b : 0xef4444,
      fields,
    }),
  );

  return { ok: true };
});
