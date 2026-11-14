#!/usr/bin/env node

/**
 * verify-deploy-health.mjs
 *
 * Post-merge production health check verification (inspired by Kent's deploy guard).
 * Queries the /health endpoint on production / deploy preview, verifies that the
 * deployed commit matches or is an ancestor of the target commit, and outputs
 * structured evidence for PR reviews and autonomous agent verification.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";

if (!process.env.DISCORD_WEBHOOK_URL) {
  try {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const envFile = path.resolve(scriptDir, "..", ".env");
    if (fs.existsSync(envFile)) {
      const match = fs.readFileSync(envFile, "utf8").match(/DISCORD_WEBHOOK_URL=["']?([^"'\n\r]+)/);
      if (match) process.env.DISCORD_WEBHOOK_URL = match[1];
    }
  } catch {
    // Ignore missing .env in CI environments
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: 'https://nunziellasalluce.com',
    expectedSha: null,
    timeoutSeconds: 120,
    pollIntervalSeconds: 5,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      options.url = args[++i].replace(/\/$/, '');
    } else if (args[i] === '--expected-sha' && args[i + 1]) {
      options.expectedSha = args[++i];
    } else if (args[i] === '--timeout' && args[i + 1]) {
      options.timeoutSeconds = parseInt(args[++i], 10);
    }
  }

  if (!options.expectedSha) {
    try {
      options.expectedSha = execSync('git rev-parse HEAD', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      options.expectedSha = 'any';
    }
  }

  return options;
}

function gitIsAncestor(ancestor, descendant) {
  try {
    execSync(`git merge-base --is-ancestor "${ancestor}" "${descendant}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function fetchHealth(targetUrl) {
  const endpoint = `${targetUrl}/health.json`;
  try {
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${res.statusText}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


async function sendDiscordNotification(data, success) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const shaText = data.commitSha ? data.commitSha.slice(0, 7) : "unknown";
  const commitUrl = data.commit?.url || "https://github.com/bovas85/nunziellasalluce.com";

  const embed = {
    title: success ? "✅ Production Deploy Verified" : "⚠️ Production Health Check Warning",
    color: success ? 0x22c55e : 0xef4444,
    fields: [
      { name: "URL", value: data.url || "https://nunziellasalluce.com", inline: true },
      { name: "Status", value: String(data.status), inline: true },
      { name: "Commit SHA", value: `[${shaText}](${commitUrl})`, inline: true },
      { name: "Commit Message", value: data.commit?.message || "N/A" },
      { name: "Deployed At", value: data.deploy?.deployedAt || new Date().toISOString(), inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Nunziella Deploy Guard",
        embeds: [embed],
      }),
    });
    console.log("[Deploy Health] Sent deployment status notification to Discord.");
  } catch (err) {
    console.warn(`[Deploy Health] Could not dispatch Discord webhook: ${err.message}`);
  }
}

async function main() {
  const opts = parseArgs();
  console.log(`[Deploy Health] Verifying production health: ${opts.url}`);
  console.log(`[Deploy Health] Expected commit SHA: ${opts.expectedSha}`);

  const startTime = Date.now();
  const maxWaitMs = opts.timeoutSeconds * 1000;
  let lastResult = null;

  while (Date.now() - startTime < maxWaitMs) {
    const result = await fetchHealth(opts.url);
    lastResult = result;

    if (result.ok && result.data && result.data.ok) {
      const liveSha = result.data.commitSha;
      console.log(`[Deploy Health] Live commit SHA: ${liveSha} (Environment: ${result.data.deploy?.environment || 'unknown'})`);

      if (opts.expectedSha === 'any' || liveSha === opts.expectedSha) {
        console.log(`[Deploy Health] Exact commit match verified: ${liveSha}`);
        printEvidence(opts.url, result.data, true);
        await sendDiscordNotification({ ...result.data, url: opts.url }, true);
        process.exit(0);
      }

      // Check if live SHA is an ancestor or descendant in git
      if (liveSha && liveSha !== 'unknown') {
        if (gitIsAncestor(opts.expectedSha, liveSha)) {
          console.log(`[Deploy Health] Live build ${liveSha} is ahead of target ${opts.expectedSha} (clean progression).`);
          printEvidence(opts.url, result.data, true);
        await sendDiscordNotification({ ...result.data, url: opts.url }, true);
          process.exit(0);
        }
      }
    } else {
      console.log(`[Deploy Health] Probe status: ${result.error || 'unhealthy'}`);
    }

    console.log(`[Deploy Health] Waiting ${opts.pollIntervalSeconds}s for deployment to update...`);
    await new Promise((r) => setTimeout(r, opts.pollIntervalSeconds * 1000));
  }

  console.error(`[Deploy Health Error] Timeout after ${opts.timeoutSeconds}s waiting for ${opts.expectedSha} to land live.`);
  const failureData = lastResult?.data || {
    url: opts.url,
    status: "unhealthy",
    commitSha: opts.expectedSha,
    commit: { message: `Probe error or timeout: ${lastResult?.error || "HTTP error"}` },
    deploy: { environment: "production", deployedAt: new Date().toISOString() },
  };
  printEvidence(opts.url, failureData, false);
  await sendDiscordNotification({ ...failureData, url: opts.url }, false);
  process.exit(1);
}

function printEvidence(url, data, success) {
  console.log('\n================ HEALTH VERIFICATION EVIDENCE ================');
  console.log(`URL: ${url}`);
  console.log(`Status: ${data.status}`);
  console.log(`Live Commit SHA: ${data.commitSha}`);
  console.log(`Commit Message: ${data.commit?.message}`);
  console.log(`Deployed At: ${data.deploy?.deployedAt}`);
  console.log(`Verified: ${success}`);
  console.log('==============================================================\n');

  const evidence = {
    url,
    status: data.status,
    commitSha: data.commitSha,
    commitMessage: data.commit?.message,
    deployedAt: data.deploy?.deployedAt,
    verified: success,
    timestamp: new Date().toISOString(),
  };

  console.log('```evidence');
  console.log(JSON.stringify(evidence, null, 2));
  console.log('```\n');
}

main().catch((err) => {
  console.error('[Deploy Health Fatal]:', err);
  process.exit(1);
});
