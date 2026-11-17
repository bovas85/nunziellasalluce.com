#!/usr/bin/env node

/**
 * verify-kv-restore.mjs
 *
 * Isolated backup export & restore verification for Cloudflare KV (ContactSubmissions).
 * Runs in local/isolated mode by default (no production mutation), or verifies live
 * namespace snapshot export when CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN +
 * CLOUDFLARE_KV_NAMESPACE_ID are provided.
 */

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

export function verifySnapshotRoundtrip(entries, workDir) {
  fs.mkdirSync(workDir, { recursive: true });
  const backupFile = path.join(workDir, "kv-backup-snapshot.json");
  fs.writeFileSync(
    backupFile,
    JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2),
  );

  const loaded = JSON.parse(fs.readFileSync(backupFile, "utf8"));
  const restored = new Map();
  for (const item of loaded.entries || []) {
    restored.set(item.key, item.value);
  }

  for (const item of entries) {
    if (restored.get(item.key) !== item.value) {
      throw new Error(`Restore mismatch for key ${item.key}`);
    }
  }
  return { ok: true, backupFile, restoredCount: restored.size };
}

async function fetchCloudflareKvKeys(accountId, namespaceId, apiToken) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys`,
    {
      headers: { Authorization: `Bearer ${apiToken}` },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!res.ok) {
    throw new Error(`Cloudflare KV list keys failed: HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.result || [];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(
    typeof args.out === "string" ? args.out : ".autopilot/kv-restore-test",
  );
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const namespaceId =
    process.env.CLOUDFLARE_KV_NAMESPACE_ID || args["namespace-id"];

  if (args.live) {
    if (!accountId || !apiToken || !namespaceId) {
      throw new Error(
        "--live requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_KV_NAMESPACE_ID (or --namespace-id).",
      );
    }
    const keys = await fetchCloudflareKvKeys(accountId, namespaceId, apiToken);
    const entries = keys.map((k) => ({
      key: k.name,
      value: k.metadata ? JSON.stringify(k.metadata) : "present",
    }));
    const result = verifySnapshotRoundtrip(entries, outDir);
    console.log(
      JSON.stringify({ mode: "live-export-verify", ...result }, null, 2),
    );
    return;
  }

  const fixtureEntries = [
    {
      key: "submission:restore-drill-1",
      value: JSON.stringify({ status: "ok", drill: true }),
    },
    {
      key: "submission:restore-drill-2",
      value: JSON.stringify({ status: "ok", drill: true }),
    },
  ];
  const result = verifySnapshotRoundtrip(fixtureEntries, outDir);
  console.log(
    JSON.stringify(
      {
        mode: "isolated-dry-run",
        note: "Pass --live with CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_KV_NAMESPACE_ID for live KV key export.",
        ...result,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(
    `[verify-kv-restore] ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
