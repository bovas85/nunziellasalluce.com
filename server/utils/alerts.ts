import type { H3Event } from "h3";
import { useRuntimeConfig } from "#imports";

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordAlertOptions {
  webhookUrl: string;
  title: string;
  description?: string;
  color: number;
  fields?: DiscordEmbedField[];
  username?: string;
  fetchImpl?: typeof fetch;
}

type CloudflareEventContext = {
  cloudflare?: {
    env?: Record<string, unknown>;
    context?: {
      waitUntil?: (promise: Promise<unknown>) => void;
    };
  };
};

export function getDiscordWebhookUrl(event?: H3Event): string {
  const cfEnv = event
    ? (event.context as CloudflareEventContext | undefined)?.cloudflare?.env
    : undefined;

  if (
    typeof cfEnv?.DISCORD_WEBHOOK_URL === "string" &&
    cfEnv.DISCORD_WEBHOOK_URL.trim().length > 0
  ) {
    return cfEnv.DISCORD_WEBHOOK_URL.trim();
  }

  try {
    const config = useRuntimeConfig(event) as { discordWebhookUrl?: unknown };
    if (
      typeof config?.discordWebhookUrl === "string" &&
      config.discordWebhookUrl.trim().length > 0
    ) {
      return config.discordWebhookUrl.trim();
    }
  } catch {
    // Context or runtimeConfig unavailable in some test scenarios
  }

  return (process.env.DISCORD_WEBHOOK_URL || "").trim();
}

export async function sendDiscordAlert({
  webhookUrl,
  title,
  description,
  color,
  fields = [],
  username = "Nunziella Site Monitor",
  fetchImpl = fetch,
}: DiscordAlertOptions): Promise<boolean> {
  if (!webhookUrl) return false;

  try {
    const res = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        username,
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title,
            ...(description ? { description } : {}),
            color,
            fields: fields.map((field) => ({
              ...field,
              value: field.value.slice(0, 1024),
            })),
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn(
        `[Alerts] Discord webhook returned HTTP ${res.status} ${res.statusText}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      `[Alerts] Failed to dispatch Discord webhook: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

export async function scheduleBackgroundTask(
  event: H3Event | undefined,
  task: Promise<unknown>,
): Promise<void> {
  const cfCtx = event
    ? (event.context as CloudflareEventContext | undefined)?.cloudflare?.context
    : undefined;

  if (typeof cfCtx?.waitUntil === "function") {
    cfCtx.waitUntil(task);
    return;
  }

  await task;
}
