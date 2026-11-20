#!/usr/bin/env node

/**
 * cleanup-cloudflare-previews.mjs
 *
 * Deletes deterministic PR preview Workers & KV namespaces on PR close, and
 * optionally prunes historical orphaned preview resources while strictly
 * protecting production (`nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu`).
 */

import { pathToFileURL } from "node:url";

export const PROD_WORKER_NAME =
  "nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu";
export const PROD_KV_TITLE = "nunziellasalluce-ContactSubmissions-prod";
const CF_API_BASE = "https://api.cloudflare.com/client/v4";

export function parseArgs(argv) {
  const opts = {
    pr: null,
    pruneOrphans: false,
    keepPrs: new Set(),
    apply: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--pr" && argv[i + 1]) {
      const prNum = Number.parseInt(argv[++i], 10);
      if (!Number.isInteger(prNum) || prNum <= 0) {
        throw new Error(`Invalid --pr number: ${argv[i]}`);
      }
      opts.pr = prNum;
    } else if (arg === "--prune-orphans") {
      opts.pruneOrphans = true;
    } else if (arg === "--keep-pr" && argv[i + 1]) {
      for (const part of argv[++i].split(",")) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const n = Number.parseInt(trimmed, 10);
        if (Number.isInteger(n) && n > 0) opts.keepPrs.add(n);
      }
    } else if (arg === "--apply") {
      opts.apply = true;
    } else if (arg === "--json") {
      opts.json = true;
    }
  }

  if (opts.pr === null && !opts.pruneOrphans) {
    throw new Error("Specify either --pr <number> or --prune-orphans.");
  }
  return opts;
}

export function previewNamesForPr(prNumber) {
  return {
    workerName: `nunziellasalluce-pr-${prNumber}`,
    kvTitle: `nunziellasalluce-ContactSubmissions-pr-${prNumber}`,
  };
}

export function isOrphanPreviewWorker(name, keepPrs = new Set()) {
  if (!name || name === PROD_WORKER_NAME) return false;
  if (name.includes("-prod-") || name.endsWith("-prod")) return false;

  const prMatch = /^nunziellasalluce-pr-(\d+)$/.exec(name);
  if (prMatch) {
    return !keepPrs.has(Number.parseInt(prMatch[1], 10));
  }

  return (
    name.startsWith("nunziellasalluce-nunziellasall") ||
    name.startsWith("nunziellasalluce-branch-")
  );
}

export function isOrphanPreviewKv(title, keepPrs = new Set()) {
  if (!title || title === PROD_KV_TITLE) return false;
  if (title.endsWith("-prod")) return false;

  const prMatch = /^nunziellasalluce-ContactSubmissions-pr-(\d+)$/.exec(title);
  if (prMatch) {
    return !keepPrs.has(Number.parseInt(prMatch[1], 10));
  }

  return title.startsWith("nunziellasalluce-ContactSubmissions-");
}

async function cfRequest(
  path,
  { method = "GET", accountId, apiToken, allow404 = false, fetchImpl = fetch },
) {
  const res = await fetchImpl(`${CF_API_BASE}/accounts/${accountId}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (allow404 && res.status === 404) {
    return { notFound: true, result: null };
  }

  const data = await res.json();
  if (!res.ok || data.success === false) {
    const detail = data?.errors?.[0]?.message || `HTTP ${res.status}`;
    throw new Error(`Cloudflare API ${method} ${path} failed: ${detail}`);
  }
  return {
    notFound: false,
    result: data.result,
    resultInfo: data.result_info,
  };
}

async function listAllKvNamespaces(ctx) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await cfRequest(
      `/storage/kv/namespaces?page=${page}&per_page=100`,
      ctx,
    );
    const items = Array.isArray(res.result) ? res.result : [];
    all.push(...items);
    const totalPages = res.resultInfo?.total_pages ?? 1;
    if (page >= totalPages || items.length === 0) break;
    page += 1;
  }
  return all;
}

export async function runCleanup(
  opts,
  {
    accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken = process.env.CLOUDFLARE_API_TOKEN,
    fetchImpl = fetch,
  } = {},
) {
  if (!accountId || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required.",
    );
  }

  const ctx = { accountId, apiToken, fetchImpl };
  const targetWorkers = [];
  const targetKvs = [];

  if (opts.pr !== null) {
    const { workerName, kvTitle } = previewNamesForPr(opts.pr);
    targetWorkers.push(workerName);
    const namespaces = await listAllKvNamespaces(ctx);
    for (const ns of namespaces) {
      if (ns.title === kvTitle) {
        targetKvs.push({ id: ns.id, title: ns.title });
      }
    }
  } else if (opts.pruneOrphans) {
    const workersRes = await cfRequest("/workers/scripts", ctx);
    const scripts = Array.isArray(workersRes.result) ? workersRes.result : [];
    for (const script of scripts) {
      if (isOrphanPreviewWorker(script.id, opts.keepPrs)) {
        targetWorkers.push(script.id);
      }
    }

    const namespaces = await listAllKvNamespaces(ctx);
    for (const ns of namespaces) {
      if (isOrphanPreviewKv(ns.title, opts.keepPrs)) {
        targetKvs.push({ id: ns.id, title: ns.title });
      }
    }
  }

  const deletedWorkers = [];
  const missingWorkers = [];
  const deletedKvs = [];

  if (opts.apply) {
    for (const name of targetWorkers) {
      const res = await cfRequest(
        `/workers/scripts/${encodeURIComponent(name)}`,
        { ...ctx, method: "DELETE", allow404: true },
      );
      if (res.notFound) {
        missingWorkers.push(name);
      } else {
        deletedWorkers.push(name);
      }
    }

    for (const ns of targetKvs) {
      const res = await cfRequest(
        `/storage/kv/namespaces/${encodeURIComponent(ns.id)}`,
        { ...ctx, method: "DELETE", allow404: true },
      );
      if (!res.notFound) {
        deletedKvs.push(ns.title);
      }
    }
  }

  return {
    ok: true,
    dryRun: !opts.apply,
    targetWorkers,
    targetKvs: targetKvs.map((ns) => ns.title),
    deletedWorkers,
    missingWorkers,
    deletedKvs,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const summary = await runCleanup(opts);
  if (opts.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  const mode = summary.dryRun ? "DRY RUN" : "APPLIED";
  console.log(
    `[Cloudflare Cleanup - ${mode}] targetWorkers=${summary.targetWorkers.length}, targetKvs=${summary.targetKvs.length}`,
  );
  if (summary.dryRun) {
    for (const w of summary.targetWorkers)
      console.log(`  would delete worker: ${w}`);
    for (const kv of summary.targetKvs) console.log(`  would delete KV: ${kv}`);
  } else {
    for (const w of summary.deletedWorkers)
      console.log(`  deleted worker: ${w}`);
    for (const w of summary.missingWorkers)
      console.log(`  already absent worker: ${w}`);
    for (const kv of summary.deletedKvs) console.log(`  deleted KV: ${kv}`);
  }
}

const isEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main().catch((err) => {
    console.error("[Cloudflare Cleanup Error]:", err.message);
    process.exit(1);
  });
}
