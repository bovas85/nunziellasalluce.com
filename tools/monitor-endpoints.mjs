#!/usr/bin/env node

/**
 * monitor-endpoints.mjs
 *
 * Probes nunziellasalluce.com and the WordPress CMS backends
 * (nunziella.moustachedesign.fyi, bike.moustachedesign.fyi, api.moustachedesign.fyi)
 * for availability, schema sanity, and latency spikes, dispatching a Discord
 * webhook alert when any target is down or slower than its threshold.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { isCloudflareChallenge } from "./verify-deploy-health.mjs";

export const DEFAULT_USER_AGENT =
  "nunziellasalluce-uptime-monitor/1.0 (+https://nunziellasalluce.com)";
export const DEFAULT_TIMEOUT_MS = 10_000;
export const DEFAULT_RETRIES = 1;
export const DEFAULT_RETRY_DELAY_MS = 3_000;
export const PROD_WORKERS_FALLBACK_HEALTH_URL =
  "https://nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu.nunziellasalluce.workers.dev/health.json";

export const DEFAULT_TARGETS = [
  {
    id: "nunziellasalluce-health",
    name: "nunziellasalluce.com (/health.json)",
    url: "https://nunziellasalluce.com/health.json",
    fallbackUrl: PROD_WORKERS_FALLBACK_HEALTH_URL,
    latencyThresholdMs: 3_000,
    validateJson(data) {
      if (!data || typeof data !== "object") return "Expected JSON object";
      if (data.ok !== true || data.status !== "healthy") {
        return `Unexpected health status: ${String(data.status)}`;
      }
      return null;
    },
  },
  {
    id: "wp-nunziella-pages",
    name: "nunziella.moustachedesign.fyi (WP Pages)",
    url: "https://nunziella.moustachedesign.fyi/wp-json/wp/v2/pages/18",
    latencyThresholdMs: 4_500,
    validateJson(data) {
      if (!data || typeof data !== "object" || data.id !== 18) {
        return "Expected WordPress page payload with id=18";
      }
      return null;
    },
  },
  {
    id: "wp-nunziella-cf7",
    name: "nunziella.moustachedesign.fyi (Contact Form 7)",
    url: "https://nunziella.moustachedesign.fyi/wp-json/contact-form-7/v1/",
    latencyThresholdMs: 4_500,
    validateJson(data) {
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Expected Contact Form 7 REST index JSON object";
      }
      return null;
    },
  },
  {
    id: "wp-bike",
    name: "bike.moustachedesign.fyi (WordPress)",
    url: "https://bike.moustachedesign.fyi/wp-json/",
    latencyThresholdMs: 5_000,
    validateJson(data) {
      if (
        !data ||
        typeof data !== "object" ||
        !Array.isArray(data.namespaces)
      ) {
        return "Expected WordPress REST root with namespaces array";
      }
      return null;
    },
  },
  {
    id: "wp-api",
    name: "api.moustachedesign.fyi (WordPress)",
    url: "https://api.moustachedesign.fyi/wp-json/",
    latencyThresholdMs: 4_500,
    validateJson(data) {
      if (
        !data ||
        typeof data !== "object" ||
        !Array.isArray(data.namespaces)
      ) {
        return "Expected WordPress REST root with namespaces array";
      }
      return null;
    },
  },
];

function parseIntWithMin(raw, fallback, min = 0) {
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
}

export function parseArgs(argv) {
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let retries = DEFAULT_RETRIES;
  let retryDelayMs = DEFAULT_RETRY_DELAY_MS;
  let json = false;
  let dryRun = false;
  let failOnSlow = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--timeout-ms" && argv[i + 1]) {
      timeoutMs = parseIntWithMin(argv[++i], DEFAULT_TIMEOUT_MS, 1);
    } else if (arg === "--retries" && argv[i + 1]) {
      retries = parseIntWithMin(argv[++i], DEFAULT_RETRIES, 0);
    } else if (arg === "--retry-delay-ms" && argv[i + 1]) {
      retryDelayMs = parseIntWithMin(argv[++i], DEFAULT_RETRY_DELAY_MS, 0);
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--fail-on-slow") {
      failOnSlow = true;
    }
  }

  return { timeoutMs, retries, retryDelayMs, json, dryRun, failOnSlow };
}

async function fetchTargetResponse(url, { timeoutMs, fetchImpl }) {
  return fetchImpl(url, {
    headers: {
      accept: "application/json",
      "user-agent": DEFAULT_USER_AGENT,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

export async function probeOnce(target, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fetchImpl = fetch,
    now = Date.now,
  } = options;

  let probeUrl = target.url;
  let fallbackUsed = false;
  let startedAt = now();

  try {
    let res = await fetchTargetResponse(probeUrl, { timeoutMs, fetchImpl });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      if (target.fallbackUrl && isCloudflareChallenge(res, bodyText)) {
        probeUrl = target.fallbackUrl;
        fallbackUsed = true;
        startedAt = now();
        res = await fetchTargetResponse(probeUrl, { timeoutMs, fetchImpl });
      } else {
        const latencyMs = now() - startedAt;
        return {
          id: target.id,
          name: target.name,
          url: probeUrl,
          fallbackUsed,
          status: "down",
          httpStatus: res.status,
          latencyMs,
          thresholdMs: target.latencyThresholdMs,
          error: `HTTP ${res.status} ${res.statusText || ""}`.trim(),
        };
      }
    }

    const latencyMs = now() - startedAt;

    if (!res.ok) {
      return {
        id: target.id,
        name: target.name,
        url: probeUrl,
        fallbackUsed,
        status: "down",
        httpStatus: res.status,
        latencyMs,
        thresholdMs: target.latencyThresholdMs,
        error: `HTTP ${res.status} ${res.statusText || ""}`.trim(),
      };
    }

    let data;
    try {
      data = await res.json();
    } catch {
      return {
        id: target.id,
        name: target.name,
        url: probeUrl,
        fallbackUsed,
        status: "down",
        httpStatus: res.status,
        latencyMs,
        thresholdMs: target.latencyThresholdMs,
        error: "Invalid JSON response",
      };
    }

    const validationError = target.validateJson
      ? target.validateJson(data)
      : null;
    if (validationError) {
      return {
        id: target.id,
        name: target.name,
        url: probeUrl,
        fallbackUsed,
        status: "down",
        httpStatus: res.status,
        latencyMs,
        thresholdMs: target.latencyThresholdMs,
        error: validationError,
      };
    }

    const isSlow = latencyMs > target.latencyThresholdMs;
    return {
      id: target.id,
      name: target.name,
      url: probeUrl,
      fallbackUsed,
      status: isSlow ? "slow" : "ok",
      httpStatus: res.status,
      latencyMs,
      thresholdMs: target.latencyThresholdMs,
      error: isSlow
        ? `Latency ${latencyMs}ms exceeded ${target.latencyThresholdMs}ms threshold`
        : null,
    };
  } catch (err) {
    const latencyMs = now() - startedAt;
    return {
      id: target.id,
      name: target.name,
      url: probeUrl,
      fallbackUsed,
      status: "down",
      httpStatus: null,
      latencyMs,
      thresholdMs: target.latencyThresholdMs,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function probeWithRetries(target, options = {}) {
  const {
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    sleepImpl = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options;

  let result = await probeOnce(target, options);
  let attempts = 1;

  while (result.status === "down" && attempts <= retries) {
    if (retryDelayMs > 0) {
      await sleepImpl(retryDelayMs);
    }
    result = await probeOnce(target, options);
    attempts += 1;
  }

  return { ...result, attempts };
}

export async function sendMonitorDiscordAlert(
  results,
  { fetchImpl = fetch, webhookUrl = process.env.DISCORD_WEBHOOK_URL } = {},
) {
  if (!webhookUrl) return false;

  const downTargets = results.filter((r) => r.status === "down");
  const slowTargets = results.filter((r) => r.status === "slow");
  if (downTargets.length === 0 && slowTargets.length === 0) return false;

  const hasDown = downTargets.length > 0;
  const title = hasDown
    ? `🚨 Uptime Alert: ${downTargets.length} endpoint(s) down`
    : `⚠️ Latency Alert: ${slowTargets.length} endpoint(s) slow`;

  const fields = results
    .filter((r) => r.status !== "ok")
    .map((r) => ({
      name: `${r.status === "down" ? "❌" : "🐢"} ${r.name}`,
      value: [
        `URL: ${r.url}`,
        `Status: ${r.status.toUpperCase()}${r.httpStatus ? ` (HTTP ${r.httpStatus})` : ""}`,
        `Latency: ${r.latencyMs}ms (threshold ${r.thresholdMs}ms, attempts ${r.attempts})`,
        r.error ? `Detail: ${r.error}` : null,
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 1024),
    }));

  const runUrl =
    process.env.GITHUB_SERVER_URL &&
    process.env.GITHUB_REPOSITORY &&
    process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null;

  if (runUrl) {
    fields.push({ name: "Monitor Run", value: runUrl });
  }

  try {
    const res = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        username: "Nunziella Uptime Monitor",
        embeds: [
          {
            title,
            color: hasDown ? 0xef4444 : 0xf59e0b,
            fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn(
        `[Uptime Monitor] Discord webhook returned HTTP ${res.status} ${res.statusText}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      `[Uptime Monitor] Failed to dispatch Discord alert: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

export async function runMonitor({
  targets = DEFAULT_TARGETS,
  options = parseArgs(process.argv.slice(2)),
  fetchImpl = fetch,
  now = Date.now,
  sleepImpl,
} = {}) {
  const results = await Promise.all(
    targets.map((target) =>
      probeWithRetries(target, {
        timeoutMs: options.timeoutMs,
        retries: options.retries,
        retryDelayMs: options.retryDelayMs,
        fetchImpl,
        now,
        sleepImpl,
      }),
    ),
  );

  const downCount = results.filter((r) => r.status === "down").length;
  const slowCount = results.filter((r) => r.status === "slow").length;
  const okCount = results.filter((r) => r.status === "ok").length;

  let alertSent = false;
  if (!options.dryRun && (downCount > 0 || slowCount > 0)) {
    alertSent = await sendMonitorDiscordAlert(results, { fetchImpl });
  }

  const ok = downCount === 0 && (!options.failOnSlow || slowCount === 0);
  return {
    ok,
    checkedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      ok: okCount,
      slow: slowCount,
      down: downCount,
    },
    alertSent,
    results,
  };
}

function formatSummary(report) {
  console.log("\n================ UPTIME & LATENCY MONITOR ================");
  for (const r of report.results) {
    const icon = r.status === "ok" ? "✅" : r.status === "slow" ? "🐢" : "❌";
    const httpText = r.httpStatus ? `HTTP ${r.httpStatus}` : "NO_HTTP";
    console.log(
      `${icon} ${r.name}: ${r.status.toUpperCase()} (${httpText}, ${r.latencyMs}ms / ${r.thresholdMs}ms${r.attempts > 1 ? `, ${r.attempts} attempts` : ""})${r.error ? ` — ${r.error}` : ""}`,
    );
  }
  console.log(
    `Summary: ${report.summary.ok}/${report.summary.total} ok, ${report.summary.slow} slow, ${report.summary.down} down`,
  );
  console.log("==========================================================\n");
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const options = parseArgs(process.argv.slice(2));
  const report = await runMonitor({ options });
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    formatSummary(report);
  }
  process.exit(report.ok ? 0 : 1);
}
