#!/usr/bin/env node

/**
 * control-nunziella.mjs
 *
 * Unified project control CLI for nunziellasalluce.com.
 * Commands: doctor, dev, login, request, execute, browse, map, preview, health
 */

import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const FEATURES_PATH = path.join(
  ROOT_DIR,
  ".agents/skills/control-nunziella/references/features.json",
);
const AUTOPILOT_DIR = path.join(ROOT_DIR, ".autopilot");
const COOKIES_PATH = path.join(AUTOPILOT_DIR, "cookies.json");
const DEV_ORIGIN_PATH = path.join(AUTOPILOT_DIR, "dev.origin");
const DEFAULT_LOCAL_ORIGIN = "http://127.0.0.1:3000";
const DEFAULT_PROD_ORIGIN = "https://nunziellasalluce.com";

const BOOLEAN_FLAGS = new Set([
  "json",
  "record",
  "mobile",
  "check",
  "live",
  "help",
]);

export function parseCliArgs(argv) {
  const positionals = [];
  const flags = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (
          !BOOLEAN_FLAGS.has(key) &&
          next !== undefined &&
          !next.startsWith("--")
        ) {
          flags[key] = next;
          i += 1;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positionals.push(arg);
    }
  }

  return {
    command: positionals[0] || "help",
    positionals: positionals.slice(1),
    flags,
  };
}

function outputResult(payload, asJson, humanLines) {
  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    for (const line of humanLines) {
      console.log(line);
    }
  }
}

export function discoverRoutes(rootDir = ROOT_DIR) {
  const routes = new Set();

  const pagesDir = path.join(rootDir, "app/pages");
  if (fs.existsSync(pagesDir)) {
    const walkPages = (dir, prefix = "") => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          walkPages(path.join(dir, entry.name), `${prefix}/${entry.name}`);
        } else if (entry.name.endsWith(".vue")) {
          const stem = entry.name.slice(0, -4);
          if (stem === "index") {
            routes.add(prefix || "/");
          } else {
            routes.add(`${prefix}/${stem}`);
          }
        }
      }
    };
    walkPages(pagesDir);
  }

  const serverRoutesDir = path.join(rootDir, "server/routes");
  if (fs.existsSync(serverRoutesDir)) {
    const walkServer = (dir, prefix = "") => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          walkServer(path.join(dir, entry.name), `${prefix}/${entry.name}`);
        } else if (
          entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".spec.ts")
        ) {
          const stripped = entry.name
            .replace(/\.(get|post|put|patch|delete)\.ts$/, "")
            .replace(/\.ts$/, "");
          routes.add(`${prefix}/${stripped}`);
        }
      }
    };
    walkServer(serverRoutesDir);
  }

  return Array.from(routes).sort();
}

export function validateFeatureMap(
  rootDir = ROOT_DIR,
  featuresPath = FEATURES_PATH,
) {
  if (!fs.existsSync(featuresPath)) {
    return {
      ok: false,
      errors: [
        `Feature map file missing: ${path.relative(rootDir, featuresPath)}`,
      ],
      codeRoutes: discoverRoutes(rootDir),
      mappedRoutes: [],
    };
  }

  const raw = JSON.parse(fs.readFileSync(featuresPath, "utf8"));
  const entries = Array.isArray(raw.features) ? raw.features : [];
  const codeRoutes = discoverRoutes(rootDir);
  const mappedRoutes = entries.map((e) => e.route).sort();
  const errors = [];

  for (const route of codeRoutes) {
    if (!mappedRoutes.includes(route)) {
      errors.push(`Route in code missing from Feature Map: ${route}`);
    }
  }
  for (const entry of entries) {
    if (!codeRoutes.includes(entry.route)) {
      errors.push(`Feature Map references non-existent route: ${entry.route}`);
    }
    if (!entry.reach || typeof entry.reach !== "string") {
      errors.push(`Feature Map entry "${entry.route}" missing "reach" notes`);
    }
    if (!entry.verify || typeof entry.verify !== "string") {
      errors.push(
        `Feature Map entry "${entry.route}" missing "verify" instructions`,
      );
    }
  }

  return { ok: errors.length === 0, errors, codeRoutes, mappedRoutes, entries };
}

function readCookiesStore() {
  if (!fs.existsSync(COOKIES_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(COOKIES_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeCookiesStore(store) {
  fs.mkdirSync(AUTOPILOT_DIR, { recursive: true });
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(store, null, 2));
}

function normalizeOrigin(origin) {
  return String(origin || DEFAULT_LOCAL_ORIGIN).replace(/\/$/, "");
}

function resolveLocalOrigin(explicitOrigin) {
  if (explicitOrigin) return normalizeOrigin(explicitOrigin);
  if (fs.existsSync(DEV_ORIGIN_PATH)) {
    const saved = fs.readFileSync(DEV_ORIGIN_PATH, "utf8").trim();
    if (saved) return normalizeOrigin(saved);
  }
  return DEFAULT_LOCAL_ORIGIN;
}

function getFreePort(preferredPort) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", () => {
      const fallback = net.createServer();
      fallback.listen(0, "127.0.0.1", () => {
        const addr = fallback.address();
        const chosen = typeof addr === "object" && addr ? addr.port : 3099;
        fallback.close((err) => (err ? reject(err) : resolve(chosen)));
      });
    });
    srv.listen(preferredPort, "127.0.0.1", () => {
      srv.close((err) => (err ? reject(err) : resolve(preferredPort)));
    });
  });
}

function buildCookieHeader(origin) {
  const store = readCookiesStore();
  const jar = store[normalizeOrigin(origin)] || {};
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function cmdDoctor(flags) {
  const checks = [];
  const majorNode = Number(process.versions.node.split(".")[0]);
  checks.push({
    name: "node",
    ok: majorNode >= 22,
    detail: `v${process.versions.node}`,
    fix: "Install Node >= 22 (see .nvmrc: 24.13.0)",
  });

  const hasNodeModules = fs.existsSync(path.join(ROOT_DIR, "node_modules"));
  checks.push({
    name: "node_modules",
    ok: hasNodeModules,
    detail: hasNodeModules ? "installed" : "missing",
    fix: "Run: yarn install --frozen-lockfile --ignore-engines",
  });

  const hasNuxtTypes = fs.existsSync(
    path.join(ROOT_DIR, ".nuxt/tsconfig.json"),
  );
  checks.push({
    name: "nuxt_prepare",
    ok: hasNuxtTypes,
    detail: hasNuxtTypes ? ".nuxt/tsconfig.json present" : "missing",
    fix: "Run: yarn nuxt prepare",
  });

  const hasPreCommit = fs.existsSync(path.join(ROOT_DIR, ".husky/pre-commit"));
  const hasPrePush = fs.existsSync(path.join(ROOT_DIR, ".husky/pre-push"));
  checks.push({
    name: "git_hooks",
    ok: hasPreCommit && hasPrePush,
    detail: `pre-commit=${hasPreCommit}, pre-push=${hasPrePush}`,
    fix: "Run: yarn prepare",
  });

  const mapValidation = validateFeatureMap();
  checks.push({
    name: "feature_map",
    ok: mapValidation.ok,
    detail: mapValidation.ok
      ? `${mapValidation.codeRoutes.length} routes synced`
      : mapValidation.errors.join("; "),
    fix: "Update .agents/skills/control-nunziella/references/features.json",
  });

  let playwrightOk = false;
  let playwrightDetail;
  try {
    const pw = await import("playwright");
    const execPath = pw.chromium.executablePath();
    playwrightOk = Boolean(execPath && fs.existsSync(execPath));
    playwrightDetail = playwrightOk ? execPath : `binary missing (${execPath})`;
  } catch (err) {
    playwrightDetail = err instanceof Error ? err.message : String(err);
  }
  checks.push({
    name: "playwright",
    ok: playwrightOk,
    detail: playwrightDetail,
    fix: "Run: npx playwright install chromium",
  });

  const origin = flags.origin ? normalizeOrigin(flags.origin) : null;
  if (origin) {
    try {
      const res = await fetch(`${origin}/health.json`, {
        signal: AbortSignal.timeout(4000),
      });
      checks.push({
        name: "health_endpoint",
        ok: res.ok,
        detail: `${origin}/health.json -> HTTP ${res.status}`,
        fix: "Start local dev server with: node tools/control-nunziella.mjs dev",
      });
    } catch (err) {
      checks.push({
        name: "health_endpoint",
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
        fix: "Start local dev server with: node tools/control-nunziella.mjs dev",
      });
    }
  }

  const ok = checks.every((c) => c.ok);
  const lines = checks.map(
    (c) =>
      `${c.ok ? "[ok]" : "[fail]"} ${c.name}: ${c.detail}${c.ok ? "" : ` | Fix: ${c.fix}`}`,
  );
  outputResult({ ok, checks }, Boolean(flags.json), lines);
  if (!ok) process.exitCode = 1;
}

async function isServerHealthy(origin) {
  try {
    const res = await fetch(`${origin}/health.json`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function cmdDev(flags) {
  const preferred = Number(flags.port || 3000);
  const existingOrigin = flags.port
    ? `http://127.0.0.1:${preferred}`
    : resolveLocalOrigin();

  if (await isServerHealthy(existingOrigin)) {
    outputResult(
      { ok: true, reused: true, origin: existingOrigin },
      Boolean(flags.json),
      [`Reusing healthy server at ${existingOrigin}`],
    );
    return;
  }

  const port = flags.port ? preferred : await getFreePort(preferred);
  const origin = `http://127.0.0.1:${port}`;

  fs.mkdirSync(AUTOPILOT_DIR, { recursive: true });
  const logPath = path.join(AUTOPILOT_DIR, "dev.log");
  const pidPath = path.join(AUTOPILOT_DIR, "dev.pid");
  const outFd = fs.openSync(logPath, "a");

  const child = spawn(
    "yarn",
    ["dev", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: ROOT_DIR,
      detached: true,
      stdio: ["ignore", outFd, outFd],
      env: { ...process.env, NITRO_PORT: String(port), PORT: String(port) },
    },
  );
  child.unref();
  fs.closeSync(outFd);
  fs.writeFileSync(pidPath, String(child.pid));

  const deadline = Date.now() + Number(flags.timeout || 45) * 1000;
  while (Date.now() < deadline) {
    if (await isServerHealthy(origin)) {
      fs.writeFileSync(DEV_ORIGIN_PATH, origin);
      outputResult(
        { ok: true, reused: false, pid: child.pid, origin, logPath },
        Boolean(flags.json),
        [`Started local server at ${origin} (pid ${child.pid})`],
      );
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  outputResult(
    {
      ok: false,
      error: `Timed out waiting for ${origin}/health.json`,
      logPath,
    },
    Boolean(flags.json),
    [`Failed to start server at ${origin}. Check ${logPath}`],
  );
  process.exitCode = 1;
}

async function cmdLogin(flags) {
  if (
    !process.env.CASE_STUDY_PASSWORD &&
    typeof process.loadEnvFile === "function"
  ) {
    try {
      process.loadEnvFile(path.join(ROOT_DIR, ".env"));
    } catch {
      // Ignore missing .env file
    }
  }
  const origin = resolveLocalOrigin(flags.origin);
  const password =
    typeof flags.password === "string"
      ? flags.password
      : process.env.CASE_STUDY_PASSWORD || "";

  if (!password) {
    outputResult(
      {
        ok: false,
        error: "CASE_STUDY_PASSWORD env var or --password flag is required",
      },
      Boolean(flags.json),
      [
        "CASE_STUDY_PASSWORD is not set. Pass --password or set CASE_STUDY_PASSWORD in environment / .env.",
      ],
    );
    process.exitCode = 1;
    return;
  }

  const res = await fetch(`${origin}/api/verify-access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const body = await res.text();
    outputResult({ ok: false, status: res.status, body }, Boolean(flags.json), [
      `Login failed (${res.status}): ${body}`,
    ]);
    process.exitCode = 1;
    return;
  }

  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")]
        : [];

  const jar = {};
  for (const rawCookie of setCookies) {
    const firstPart = rawCookie.split(";")[0];
    const eq = firstPart.indexOf("=");
    if (eq > 0) {
      jar[firstPart.slice(0, eq).trim()] = firstPart.slice(eq + 1).trim();
    }
  }

  const store = readCookiesStore();
  store[origin] = jar;
  writeCookiesStore(store);

  const checkRes = await fetch(`${origin}/api/verify-access`, {
    headers: { Cookie: buildCookieHeader(origin) },
  });
  const checkJson = await checkRes.json().catch(() => ({}));
  const ok = checkRes.ok && checkJson.authenticated === true;

  outputResult(
    { ok, origin, authenticated: Boolean(checkJson.authenticated) },
    Boolean(flags.json),
    [
      ok
        ? `Authenticated session stored for ${origin}`
        : `Session check failed for ${origin}`,
    ],
  );
  if (!ok) process.exitCode = 1;
}

export async function performRequest({
  method = "GET",
  targetPath = "/",
  origin = DEFAULT_LOCAL_ORIGIN,
  contains,
  data,
  dump,
  cookieHeader = "",
}) {
  const base = normalizeOrigin(origin);
  const url = targetPath.startsWith("http")
    ? targetPath
    : `${base}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;

  const headers = { Accept: "text/html,application/json,*/*" };
  if (cookieHeader) headers.Cookie = cookieHeader;
  let body;
  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
    body = typeof data === "string" ? data : JSON.stringify(data);
  }

  const res = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    body,
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();

  if (dump) {
    fs.mkdirSync(path.dirname(path.resolve(dump)), { recursive: true });
    fs.writeFileSync(path.resolve(dump), text, "utf8");
  }

  const containsOk = contains ? text.includes(String(contains)) : true;
  const ok = res.ok && containsOk;
  return {
    ok,
    url,
    status: res.status,
    contains: contains || null,
    containsMatched: containsOk,
    bytes: Buffer.byteLength(text),
    snippet: text.slice(0, 240),
  };
}

async function cmdRequest(positionals, flags) {
  const method = positionals[0] || "GET";
  const targetPath = positionals[1] || "/";
  const origin = resolveLocalOrigin(flags.origin);
  const result = await performRequest({
    method,
    targetPath,
    origin,
    contains: typeof flags.contains === "string" ? flags.contains : undefined,
    data: typeof flags.data === "string" ? flags.data : undefined,
    dump: typeof flags.dump === "string" ? flags.dump : undefined,
    cookieHeader: buildCookieHeader(origin),
  });

  outputResult(result, Boolean(flags.json), [
    `${method.toUpperCase()} ${result.url} -> ${result.status} (${result.bytes} bytes)`,
    result.contains
      ? `contains "${result.contains}": ${result.containsMatched ? "matched" : "MISSING"}`
      : "contains check: skipped",
  ]);
  if (!result.ok) process.exitCode = 1;
}

async function cmdExecute(flags) {
  const codeFile = flags["code-file"];
  if (!codeFile || typeof codeFile !== "string") {
    throw new Error("--code-file <path> is required");
  }
  const absFile = path.resolve(codeFile);
  const origin = resolveLocalOrigin(flags.origin);
  const cookieHeader = buildCookieHeader(origin);

  if (absFile.endsWith(".json")) {
    const spec = JSON.parse(fs.readFileSync(absFile, "utf8"));
    const steps = Array.isArray(spec.requests) ? spec.requests : [];
    const results = [];
    for (const step of steps) {
      const r = await performRequest({
        method: step.method || "GET",
        targetPath: step.path || "/",
        origin,
        contains: step.contains,
        data: step.body,
        cookieHeader,
      });
      if (step.expectedStatus && r.status !== step.expectedStatus) {
        r.ok = false;
      }
      results.push(r);
    }
    const ok = results.every((r) => r.ok);
    outputResult(
      { ok, origin, results },
      Boolean(flags.json),
      results.map((r) => `${r.ok ? "[ok]" : "[fail]"} ${r.url} -> ${r.status}`),
    );
    if (!ok) process.exitCode = 1;
    return;
  }

  const mod = await import(absFile);
  if (typeof mod.default !== "function" && typeof mod.run !== "function") {
    throw new Error(`Fixture ${codeFile} must export default or run()`);
  }
  const fn = mod.run || mod.default;
  const output = await fn({
    origin,
    request: (opts) => performRequest({ origin, cookieHeader, ...opts }),
  });
  outputResult({ ok: true, origin, output }, Boolean(flags.json), [
    `Executed ${path.relative(ROOT_DIR, absFile)} against ${origin}`,
  ]);
}

async function cmdBrowse(flags) {
  const origin = resolveLocalOrigin(flags.origin);
  const targetPath = typeof flags.path === "string" ? flags.path : "/";
  const url = `${origin}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;
  const outDir = path.resolve(
    typeof flags.out === "string"
      ? flags.out
      : path.join(AUTOPILOT_DIR, "recordings"),
  );
  fs.mkdirSync(outDir, { recursive: true });

  const pw = await import("playwright");
  const browser = await pw.chromium.launch({ headless: true });
  const consoleErrors = [];
  const pageErrors = [];
  const artifacts = [];

  try {
    const contextOptions = {
      viewport: flags.mobile
        ? { width: 390, height: 844 }
        : { width: 1280, height: 800 },
    };
    if (flags.record) {
      contextOptions.recordVideo = {
        dir: outDir,
        size: contextOptions.viewport,
      };
    }

    const context = await browser.newContext(contextOptions);
    const store = readCookiesStore();
    const jar = store[origin] || {};
    const parsedUrl = new URL(origin);
    const cookies = Object.entries(jar).map(([name, value]) => ({
      name,
      value,
      domain: parsedUrl.hostname,
      path: "/",
    }));
    if (cookies.length > 0) {
      await context.addCookies(cookies);
    }

    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const title = await page.title();
    const screenshotPath = path.join(
      outDir,
      `browse-${flags.mobile ? "mobile" : "desktop"}-${Date.now()}.png`,
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    artifacts.push(screenshotPath);

    let videoPath = null;
    if (flags.record && page.video()) {
      await context.close();
      const rawVideoPath = await page.video().path();
      const mp4VideoPath = rawVideoPath.replace(/\.webm$/i, ".mp4");
      try {
        execFileSync(
          "ffmpeg",
          [
            "-y",
            "-i",
            rawVideoPath,
            "-vf",
            "scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            mp4VideoPath,
          ],
          { stdio: "ignore" },
        );
        if (fs.existsSync(mp4VideoPath) && mp4VideoPath !== rawVideoPath) {
          fs.rmSync(rawVideoPath, { force: true });
          videoPath = mp4VideoPath;
        } else {
          videoPath = rawVideoPath;
        }
      } catch {
        videoPath = rawVideoPath;
      }
      artifacts.push(videoPath);
    } else {
      await context.close();
    }

    const ok = consoleErrors.length === 0 && pageErrors.length === 0;
    outputResult(
      { ok, url, title, consoleErrors, pageErrors, artifacts },
      Boolean(flags.json),
      [
        `Browsed ${url} (title: "${title}")`,
        `Console errors: ${consoleErrors.length}, Page errors: ${pageErrors.length}`,
        ...artifacts.map((a) => `Artifact: ${a}`),
      ],
    );
    if (!ok) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

function cmdMap(positionals, flags) {
  if (flags.check) {
    const validation = validateFeatureMap();
    outputResult(
      validation,
      Boolean(flags.json),
      validation.ok
        ? [
            `Feature Map valid: ${validation.codeRoutes.length} routes verified.`,
          ]
        : validation.errors.map((e) => `[fail] ${e}`),
    );
    if (!validation.ok) process.exitCode = 1;
    return;
  }

  const validation = validateFeatureMap();
  const filter = positionals[0];
  const entries = validation.entries || [];
  const matched = filter
    ? entries.filter(
        (e) =>
          e.route.toLowerCase().includes(filter.toLowerCase()) ||
          e.feature.toLowerCase().includes(filter.toLowerCase()),
      )
    : entries;

  outputResult(
    { ok: validation.ok, features: matched },
    Boolean(flags.json),
    matched.map(
      (e) =>
        `${e.route} (${e.feature}) — reach: ${e.reach} | verify: ${e.verify}`,
    ),
  );
}

async function cmdPreview(flags) {
  const pr = flags.pr;
  if (!pr) throw new Error("--pr <number> is required");

  const raw = execFileSync(
    "gh",
    ["pr", "view", String(pr), "--json", "comments,headRefOid,url"],
    { cwd: ROOT_DIR, encoding: "utf8" },
  );
  const prData = JSON.parse(raw);
  const previewComment = (prData.comments || [])
    .slice()
    .reverse()
    .find((c) => typeof c.body === "string" && c.body.includes("workers.dev"));

  const match = previewComment?.body?.match(/https:\/\/[^\s`)]+workers\.dev/);
  if (!match) {
    outputResult(
      {
        ok: false,
        error: `No Cloudflare Deploy Preview URL found on PR #${pr}`,
      },
      Boolean(flags.json),
      [`No Cloudflare Deploy Preview comment found on PR #${pr}`],
    );
    process.exitCode = 1;
    return;
  }

  const previewOrigin = match[0];
  let method = "GET";
  let targetPath =
    typeof flags.check === "string" ? flags.check : "/health.json";
  if (typeof flags.request === "string") {
    const parts = flags.request.trim().split(/\s+/);
    if (parts.length >= 2) {
      method = parts[0];
      targetPath = parts[1];
    } else {
      targetPath = parts[0];
    }
  }

  const result = await performRequest({
    method,
    targetPath,
    origin: previewOrigin,
    contains: typeof flags.contains === "string" ? flags.contains : undefined,
  });

  outputResult(
    { ...result, pr: Number(pr), previewOrigin },
    Boolean(flags.json),
    [`PR #${pr} preview ${result.url} -> ${result.status}`],
  );
  if (!result.ok) process.exitCode = 1;
}

export function verifyHealthPayload(data, expectedSha) {
  if (!data || data.ok !== true || data.status !== "healthy") {
    return { ok: false, reason: `Unhealthy payload: ${JSON.stringify(data)}` };
  }
  if (!expectedSha || expectedSha === "any") {
    return { ok: true, reason: "Healthy (no SHA filter)" };
  }
  const liveSha = String(data.commitSha || "");
  if (liveSha === expectedSha || liveSha.startsWith(expectedSha)) {
    return { ok: true, reason: `Exact commit match (${liveSha})` };
  }
  const ancestor = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", expectedSha, liveSha],
    { cwd: ROOT_DIR, stdio: "ignore" },
  );
  if (ancestor.status === 0) {
    return { ok: true, reason: `Live SHA ${liveSha} includes ${expectedSha}` };
  }
  return {
    ok: false,
    reason: `Commit mismatch: expected ${expectedSha}, live is ${liveSha}`,
  };
}

async function cmdHealth(flags) {
  const origin = normalizeOrigin(flags.origin || DEFAULT_PROD_ORIGIN);
  let expectedSha = typeof flags.sha === "string" ? flags.sha : null;
  if (!expectedSha) {
    expectedSha = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: ROOT_DIR,
      encoding: "utf8",
    }).trim();
  }

  const res = await fetch(`${origin}/health.json`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    outputResult(
      { ok: false, origin, status: res.status },
      Boolean(flags.json),
      [`Health request failed: ${origin}/health.json -> HTTP ${res.status}`],
    );
    process.exitCode = 1;
    return;
  }

  const data = await res.json();
  const check = verifyHealthPayload(data, expectedSha);
  outputResult(
    {
      ok: check.ok,
      origin,
      expectedSha,
      liveSha: data.commitSha,
      reason: check.reason,
    },
    Boolean(flags.json),
    [`${origin}/health.json -> ${check.reason}`],
  );
  if (!check.ok) process.exitCode = 1;
}

function printHelp() {
  console.log(`control-nunziella — local-first verification CLI

Usage:
  node tools/control-nunziella.mjs doctor [--origin <url>] [--json]
  node tools/control-nunziella.mjs dev [--port 3000] [--json]
  node tools/control-nunziella.mjs login [--origin <url>] [--password <pass>] [--json]
  node tools/control-nunziella.mjs request <METHOD> <path> [--origin <url>] [--contains <text>] [--dump <file>] [--data <json>] [--json]
  node tools/control-nunziella.mjs execute --code-file <file> [--origin <url>] [--json]
  node tools/control-nunziella.mjs browse [--origin <url>] --path <path> [--record] [--mobile] [--out <dir>] [--json]
  node tools/control-nunziella.mjs map [<feature>] [--check] [--json]
  node tools/control-nunziella.mjs preview --pr <n> [--request '<METHOD> <path>'] [--check <path>] [--contains <text>] [--json]
  node tools/control-nunziella.mjs health [--origin <url>] [--sha <sha>] [--json]`);
}

async function main() {
  const { command, positionals, flags } = parseCliArgs(process.argv.slice(2));
  switch (command) {
    case "doctor":
      await cmdDoctor(flags);
      break;
    case "dev":
      await cmdDev(flags);
      break;
    case "login":
      await cmdLogin(flags);
      break;
    case "request":
      await cmdRequest(positionals, flags);
      break;
    case "execute":
      await cmdExecute(flags);
      break;
    case "browse":
      await cmdBrowse(flags);
      break;
    case "map":
      cmdMap(positionals, flags);
      break;
    case "preview":
      await cmdPreview(flags);
      break;
    case "health":
      await cmdHealth(flags);
      break;
    default:
      printHelp();
      if (command !== "help") process.exitCode = 1;
      break;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error(
      `[control-nunziella] ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
}
