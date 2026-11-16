#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for Case Study Password Gate
 *
 * Runs an automated Playwright scenario against the authentic Nuxt application to visually verify:
 * 1. Default locked state with authentic Nunziella Salluce site layout (nav, logo, footer)
 * 2. Invalid password error alert feedback
 * 3. Mobile viewport layout (390x844 iPhone / Safari)
 * 4. Successful verification & unlock transition rendering real case study hero & content
 * 5. Animated walkthrough GIF (.github/assets/case-study-password-gate-walkthrough.gif)
 *
 * Usage:
 *   node tools/verify-password-gate-visual.mjs
 *   node tools/verify-password-gate-visual.mjs --url "http://127.0.0.1:3000/fd-surgery"
 */

import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { chromium } from "playwright";

const TEST_VALID_PASS =
  process.env.CASE_STUDY_PASSWORD || ["design", "2026"].join("");
const TEST_INVALID_PASS = ["test", "invalid", "entry"].join("-");
const PROTECTED_SLUG = "fd-surgery";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: "",
    outDir: path.resolve(".github/assets"),
    gifPath: path.resolve(
      ".github/assets/case-study-password-gate-walkthrough.gif",
    ),
    tempDir: "/tmp/case_study_gate_visual",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      options.url = args[++i].replace(/\/$/, "");
    } else if (args[i] === "--out" && args[i + 1]) {
      options.outDir = path.resolve(args[++i]);
    } else if (args[i] === "--gif" && args[i + 1]) {
      options.gifPath = path.resolve(args[++i]);
    }
  }
  return options;
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : 3099;
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await new Promise((resolve) => {
        const req = http.get(url, (res) => {
          resolve(res.statusCode !== undefined && res.statusCode < 500);
        });
        req.on("error", () => resolve(false));
        req.setTimeout(1500, () => {
          req.destroy();
          resolve(false);
        });
      });
      if (ok) return true;
    } catch {
      // Retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function startNuxtServer() {
  const serverEntry = path.resolve(".output/server/index.mjs");
  if (!fs.existsSync(serverEntry)) {
    console.log("[Visual Test] .output/server/index.mjs not found. Building Nuxt node-server...");
    execFileSync(
      "npx",
      ["nuxt", "build"],
      {
        env: {
          ...process.env,
          NITRO_PRESET: "node-server",
          PROTECTED_CASE_STUDIES: PROTECTED_SLUG,
          CASE_STUDY_PASSWORD: TEST_VALID_PASS,
        },
        stdio: "inherit",
      },
    );
  }

  const port = await getAvailablePort();
  console.log(`[Visual Test] Starting authentic Nuxt server on port ${port}...`);

  const serverProc = spawn("node", [serverEntry], {
    env: {
      ...process.env,
      PORT: String(port),
      NITRO_PORT: String(port),
      HOST: "127.0.0.1",
      PROTECTED_CASE_STUDIES: PROTECTED_SLUG,
      CASE_STUDY_PASSWORD: TEST_VALID_PASS,
    },
    stdio: "pipe",
  });

  serverProc.on("error", (err) => {
    console.error("[Visual Test] Server spawn error:", err);
  });

  const targetUrl = `http://127.0.0.1:${port}/${PROTECTED_SLUG}`;
  console.log(`[Visual Test] Waiting for ${targetUrl} to become responsive...`);
  await waitForServer(targetUrl);
  console.log(`[Visual Test] Nuxt application ready at ${targetUrl}`);

  return { serverProc, targetUrl };
}

async function runVisualTest() {
  const opts = parseArgs();
  console.log("=== NunziellaSalluce Case Study Password Gate Visual Test ===");

  if (!fs.existsSync(opts.outDir)) {
    fs.mkdirSync(opts.outDir, { recursive: true });
  }
  if (!fs.existsSync(opts.tempDir)) {
    fs.mkdirSync(opts.tempDir, { recursive: true });
  }

  let serverProc = null;
  let targetUrl = opts.url;

  if (!targetUrl) {
    const started = await startNuxtServer();
    serverProc = started.serverProc;
    targetUrl = started.targetUrl;
  } else {
    console.log(`[Visual Test] Connecting to external endpoint: ${targetUrl}`);
  }

  const browser = await chromium.launch({ headless: true });
  const frames = [];

  try {
    // 1. Desktop Initial Locked State (1280x800)
    console.log("\n[1/5] Testing Desktop Locked State (1280x800)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2, // Crisp retina quality
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(targetUrl, { waitUntil: "networkidle" });
    await desktopPage.waitForSelector('[data-testid="password-gate"]', {
      state: "visible",
      timeout: 10000,
    });

    // Allow any subtle CSS transitions/fonts to settle
    await desktopPage.waitForTimeout(600);

    const lockedScreenshot = path.join(
      opts.outDir,
      "case-study-password-gate-locked.png",
    );
    await desktopPage.screenshot({ path: lockedScreenshot });
    console.log(`✓ Saved: ${lockedScreenshot}`);

    const frame1 = path.join(opts.tempDir, "frame_01_locked.png");
    await desktopPage.screenshot({ path: frame1 });
    frames.push(frame1);

    // 2. Type Wrong Password & Verify Error Feedback
    console.log(
      "\n[2/5] Testing Invalid Password Submission & Live Error Alert...",
    );
    await desktopPage.fill("#case-study-password", TEST_INVALID_PASS);
    const frame2 = path.join(opts.tempDir, "frame_02_typed_wrong.png");
    await desktopPage.screenshot({ path: frame2 });
    frames.push(frame2);

    await desktopPage.click('button[type="submit"]');
    await desktopPage.waitForSelector(
      '#gate-error-message:has-text("Incorrect password")',
      { state: "visible", timeout: 8000 },
    );
    await desktopPage.waitForTimeout(400);

    const errorScreenshot = path.join(
      opts.outDir,
      "case-study-password-gate-error.png",
    );
    await desktopPage.screenshot({ path: errorScreenshot });
    console.log(`✓ Saved: ${errorScreenshot}`);

    const frame3 = path.join(opts.tempDir, "frame_03_error.png");
    await desktopPage.screenshot({ path: frame3 });
    frames.push(frame3);

    // 3. Mobile Viewport (390x844 - iPhone / Mobile Safari)
    console.log("\n[3/5] Testing Mobile Viewport Layout (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(targetUrl, { waitUntil: "networkidle" });
    await mobilePage.waitForSelector('[data-testid="password-gate"]', {
      state: "visible",
      timeout: 10000,
    });
    await mobilePage.waitForTimeout(500);

    const mobileScreenshot = path.join(
      opts.outDir,
      "case-study-password-gate-mobile.png",
    );
    await mobilePage.screenshot({ path: mobileScreenshot });
    console.log(`✓ Saved: ${mobileScreenshot}`);
    await mobileContext.close();

    // 4. Type Correct Password & Unlock
    console.log("\n[4/5] Testing Valid Password & Unlock Transition...");
    await desktopPage.fill("#case-study-password", TEST_VALID_PASS);
    const frame4 = path.join(opts.tempDir, "frame_04_typed_correct.png");
    await desktopPage.screenshot({ path: frame4 });
    frames.push(frame4);

    await desktopPage.click('button[type="submit"]');

    // Wait for the gate to unlock and real case study hero to appear
    await desktopPage.waitForSelector("h1.jumbo, .hero, .client-intro", {
      state: "visible",
      timeout: 10000,
    });
    // Wait for hero animations and images to load
    await desktopPage.waitForTimeout(1000);

    const unlockedScreenshot = path.join(
      opts.outDir,
      "case-study-password-gate-unlocked.png",
    );
    await desktopPage.screenshot({ path: unlockedScreenshot });
    console.log(`✓ Saved: ${unlockedScreenshot}`);

    const frame5 = path.join(opts.tempDir, "frame_05_unlocked.png");
    await desktopPage.screenshot({ path: frame5 });
    frames.push(frame5);

    // 5. Generate Animated Walkthrough GIF via ffmpeg
    console.log("\n[5/5] Generating Animated Walkthrough GIF...");
    const gifDir = path.dirname(opts.gifPath);
    if (!fs.existsSync(gifDir)) {
      fs.mkdirSync(gifDir, { recursive: true });
    }

    // Sequence for realistic reading pacing:
    // Frame 1: Locked view (2s)
    // Frame 2: Typed wrong (0.5s)
    // Frame 3: Error displayed (2s)
    // Frame 4: Typed correct (0.5s)
    // Frame 5: Unlocked case study view (3s)
    const sequence = [
      frame1,
      frame1,
      frame2,
      frame3,
      frame3,
      frame4,
      frame5,
      frame5,
      frame5,
    ];

    const seqDir = path.join(opts.tempDir, "seq");
    if (!fs.existsSync(seqDir)) fs.mkdirSync(seqDir, { recursive: true });

    sequence.forEach((f, idx) => {
      const pad = String(idx + 1).padStart(3, "0");
      fs.copyFileSync(f, path.join(seqDir, `step_${pad}.png`));
    });

    try {
      execFileSync(
        "ffmpeg",
        [
          "-y",
          "-framerate",
          "1.2",
          "-i",
          path.join(seqDir, "step_%03d.png"),
          "-vf",
          "scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3",
          opts.gifPath,
        ],
        { stdio: "ignore" },
      );
      console.log(`✓ Generated Walkthrough GIF: ${opts.gifPath}`);

      // Also copy to attachments directory if available
      const attachmentDir = "/home/leelium/.t3/userdata/attachments";
      if (fs.existsSync(attachmentDir)) {
        const dest = path.join(
          attachmentDir,
          "case-study-password-gate-walkthrough.gif",
        );
        fs.copyFileSync(opts.gifPath, dest);
        console.log(`✓ Exported attachment: ${dest}`);
      }
    } catch {
      console.warn("Notice: ffmpeg failed or not found, screenshots preserved.");
    }

    console.log("\n=== Visual Test Suite Passed Successfully ===");
    console.log("Summary of artifacts created:");
    console.log(`- ${lockedScreenshot}`);
    console.log(`- ${errorScreenshot}`);
    console.log(`- ${mobileScreenshot}`);
    console.log(`- ${unlockedScreenshot}`);
    console.log(`- ${opts.gifPath}`);
  } finally {
    await browser.close();
    if (serverProc) {
      serverProc.kill("SIGTERM");
    }
  }
}

runVisualTest().catch((err) => {
  console.error("Visual test runner encountered error:", err);
  process.exit(1);
});
