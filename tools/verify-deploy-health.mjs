#!/usr/bin/env node

/**
 * verify-deploy-health.mjs
 *
 * Post-merge production health check verification.
 * Queries the /health.json endpoint on production / deploy preview, verifies that
 * the deployed commit matches or is an ancestor of the target commit, and outputs
 * structured evidence for PR reviews and autonomous agent verification.
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

if (
  !process.env.DISCORD_WEBHOOK_URL &&
  typeof process.loadEnvFile === "function"
) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // Ignore missing .env file in CI environments
  }
}

export const DEFAULT_USER_AGENT = "nunziellasalluce-deploy-health/1.0";

export function parseArgs(args = process.argv.slice(2)) {
  const options = {
    url: "https://nunziellasalluce.com",
    fallbackUrl: process.env.DEPLOY_HEALTH_FALLBACK_URL
      ? process.env.DEPLOY_HEALTH_FALLBACK_URL.replace(/\/$/, "")
      : null,
    expectedSha: null,
    timeoutSeconds: 120,
    pollIntervalSeconds: 5,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      options.url = args[++i].replace(/\/$/, "");
    } else if (args[i] === "--fallback-url" && args[i + 1]) {
      options.fallbackUrl = args[++i].replace(/\/$/, "");
    } else if (args[i] === "--expected-sha" && args[i + 1]) {
      options.expectedSha = args[++i];
    } else if (args[i] === "--timeout" && args[i + 1]) {
      options.timeoutSeconds = parseInt(args[++i], 10);
    } else if (args[i] === "--poll-interval" && args[i + 1]) {
      options.pollIntervalSeconds = Number(args[++i]);
    }
  }

  if (!options.expectedSha) {
    if (process.env.SHIP_PR_SHA) {
      options.expectedSha = process.env.SHIP_PR_SHA;
    } else {
      try {
        options.expectedSha = execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
      } catch {
        options.expectedSha = "any";
      }
    }
  }

  return options;
}

export function gitIsAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function isCloudflareChallenge(res, bodyText = "") {
  if (!res || res.status !== 403) return false;
  const cfMitigated = res.headers?.get?.("cf-mitigated");
  if (cfMitigated && cfMitigated.toLowerCase() === "challenge") {
    return true;
  }
  return /<title>\s*Just a moment\.\.\.\s*<\/title>/i.test(bodyText);
}

export async function fetchHealth(targetUrl, fetchImpl = fetch) {
  const endpoint = `${targetUrl}/health.json`;
  try {
    const res = await fetchImpl(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": DEFAULT_USER_AGENT,
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      const cfChallenge = isCloudflareChallenge(res, bodyText);
      const hasCfMitigatedHeader =
        res.headers?.get?.("cf-mitigated")?.toLowerCase() === "challenge";
      const challengeSuffix = hasCfMitigatedHeader
        ? " (cf-mitigated: challenge)"
        : " (Cloudflare challenge)";
      return {
        ok: false,
        status: res.status,
        cfChallenge,
        error: cfChallenge
          ? `HTTP ${res.status} ${res.statusText}${challengeSuffix}`
          : `HTTP ${res.status} ${res.statusText}`,
      };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      cfChallenge: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function sendDiscordNotification(
  data,
  success,
  fetchImpl = fetch,
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const shaText = data.commitSha ? data.commitSha.slice(0, 7) : "unknown";
  const commitUrl =
    data.commit?.url || "https://github.com/bovas85/nunziellasalluce.com";

  const embed = {
    title: success
      ? "✅ Production Deploy Verified"
      : "⚠️ Production Health Check Warning",
    color: success ? 0x22c55e : 0xef4444,
    fields: [
      {
        name: "URL",
        value: data.url || "https://nunziellasalluce.com",
        inline: true,
      },
      { name: "Status", value: String(data.status), inline: true },
      {
        name: "Commit SHA",
        value: `[${shaText}](${commitUrl})`,
        inline: true,
      },
      { name: "Commit Message", value: data.commit?.message || "N/A" },
      {
        name: "Deployed At",
        value: data.deploy?.deployedAt || new Date().toISOString(),
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Nunziella Deploy Guard",
        embeds: [embed],
      }),
    });
    console.log(
      "[Deploy Health] Sent deployment status notification to Discord.",
    );
  } catch (err) {
    console.warn(
      `[Deploy Health] Could not dispatch Discord webhook: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function printEvidence(url, data, success, meta = {}) {
  console.log(
    "\n================ HEALTH VERIFICATION EVIDENCE ================",
  );
  console.log(`URL: ${url}`);
  if (meta.usedFallback && meta.primaryUrl) {
    console.log(`Primary URL (Cloudflare challenge): ${meta.primaryUrl}`);
  }
  console.log(`Status: ${data.status}`);
  console.log(`Live Commit SHA: ${data.commitSha}`);
  console.log(`Commit Message: ${data.commit?.message}`);
  console.log(`Deployed At: ${data.deploy?.deployedAt}`);
  console.log(`Verified: ${success}`);
  console.log(
    "==============================================================\n",
  );

  const evidence = {
    url,
    ...(meta.usedFallback && meta.primaryUrl
      ? { primaryUrl: meta.primaryUrl, fallbackUsed: true }
      : {}),
    status: data.status,
    commitSha: data.commitSha,
    commitMessage: data.commit?.message,
    deployedAt: data.deploy?.deployedAt,
    verified: success,
    timestamp: new Date().toISOString(),
  };

  console.log("```evidence");
  console.log(JSON.stringify(evidence, null, 2));
  console.log("```\n");
}

export async function verifyDeployHealth(opts, deps = {}) {
  const fetchHealthImpl = deps.fetchHealth || fetchHealth;
  const gitIsAncestorImpl = deps.gitIsAncestor || gitIsAncestor;
  const notifyImpl = deps.sendDiscordNotification || sendDiscordNotification;
  const sleepImpl =
    deps.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));

  console.log(`[Deploy Health] Verifying production health: ${opts.url}`);
  if (opts.fallbackUrl) {
    console.log(`[Deploy Health] Fallback Worker URL: ${opts.fallbackUrl}`);
  }
  console.log(`[Deploy Health] Expected commit SHA: ${opts.expectedSha}`);

  const startTime = Date.now();
  const maxWaitMs = opts.timeoutSeconds * 1000;
  let activeUrl = opts.url;
  let usedFallback = false;
  let pendingFallbackProbe = false;
  let lastResult = null;

  while (Date.now() - startTime < maxWaitMs || pendingFallbackProbe) {
    pendingFallbackProbe = false;
    const result = await fetchHealthImpl(activeUrl);
    lastResult = result;

    if (result.ok && result.data && result.data.ok) {
      const liveSha = result.data.commitSha;
      console.log(
        `[Deploy Health] Live commit SHA: ${liveSha} (Environment: ${result.data.deploy?.environment || "unknown"})`,
      );

      if (opts.expectedSha === "any" || liveSha === opts.expectedSha) {
        console.log(`[Deploy Health] Exact commit match verified: ${liveSha}`);
        printEvidence(activeUrl, result.data, true, {
          primaryUrl: opts.url,
          usedFallback,
        });
        await notifyImpl({ ...result.data, url: activeUrl }, true);
        return { ok: true, url: activeUrl, usedFallback, data: result.data };
      }

      if (liveSha && liveSha !== "unknown") {
        if (gitIsAncestorImpl(opts.expectedSha, liveSha)) {
          console.log(
            `[Deploy Health] Live build ${liveSha} is ahead of target ${opts.expectedSha} (clean progression).`,
          );
          printEvidence(activeUrl, result.data, true, {
            primaryUrl: opts.url,
            usedFallback,
          });
          await notifyImpl({ ...result.data, url: activeUrl }, true);
          return { ok: true, url: activeUrl, usedFallback, data: result.data };
        }
      }
    } else if (
      result.cfChallenge &&
      !usedFallback &&
      opts.fallbackUrl &&
      opts.fallbackUrl !== activeUrl
    ) {
      console.log(
        `[Deploy Health] Primary URL ${activeUrl} blocked by Cloudflare challenge (${result.error}); falling back to Worker URL: ${opts.fallbackUrl}`,
      );
      activeUrl = opts.fallbackUrl;
      usedFallback = true;
      pendingFallbackProbe = true;
      continue;
    } else {
      console.log(
        `[Deploy Health] Probe status: ${result.error || "unhealthy"}`,
      );
    }

    console.log(
      `[Deploy Health] Waiting ${opts.pollIntervalSeconds}s for deployment to update...`,
    );
    await sleepImpl(opts.pollIntervalSeconds * 1000);
  }

  console.error(
    `[Deploy Health Error] Timeout after ${opts.timeoutSeconds}s waiting for ${opts.expectedSha} to land live.`,
  );
  const failureData = lastResult?.data || {
    url: activeUrl,
    status: "unhealthy",
    commitSha: opts.expectedSha,
    commit: {
      message: `Probe error or timeout: ${lastResult?.error || "HTTP error"}`,
    },
    deploy: {
      environment: "production",
      deployedAt: new Date().toISOString(),
    },
  };
  printEvidence(activeUrl, failureData, false, {
    primaryUrl: opts.url,
    usedFallback,
  });
  await notifyImpl({ ...failureData, url: activeUrl }, false);
  return { ok: false, url: activeUrl, usedFallback, data: failureData };
}

async function main() {
  const opts = parseArgs();
  const outcome = await verifyDeployHealth(opts);
  process.exit(outcome.ok ? 0 : 1);
}

const isDirectExecution =
  Boolean(process.argv[1]) &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  main().catch((err) => {
    console.error("[Deploy Health Fatal]:", err);
    process.exit(1);
  });
}
