#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for Work Menu Anchor Navigation
 *
 * Runs an automated Playwright scenario against the Nuxt application to verify:
 * 1. Desktop (1280x800): clicking Work from /, /#work (scrolled), /about, and direct /#work
 *    lands with #work cleanly below the fixed header, visible at opacity 1, and overflow visible
 * 2. Mobile (390x844): clicking Work from /, /about, and direct /#work unlocks scroll overflow,
 *    lands with #work cleanly below the 60px fixed header, and reveals #work at opacity 1
 * 3. H.264 MP4 walkthrough video (.github/assets/work-menu-anchor-walkthrough.mp4) + PNG keyframes
 *
 * Usage:
 *   node tools/verify-work-menu-anchor-visual.mjs
 *   node tools/verify-work-menu-anchor-visual.mjs --url "http://127.0.0.1:3000"
 */

import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { chromium } from "playwright";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: "",
    outDir: path.resolve(".github/assets"),
    mp4Path: path.resolve(".github/assets/work-menu-anchor-walkthrough.mp4"),
    tempDir: "/tmp/work_menu_anchor_visual",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      options.url = args[++i].replace(/\/$/, "");
    } else if (args[i] === "--out" && args[i + 1]) {
      options.outDir = path.resolve(args[++i]);
    } else if (args[i] === "--mp4" && args[i + 1]) {
      options.mp4Path = path.resolve(args[++i]);
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

async function waitForServer(url, timeoutMs = 30000) {
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
  throw new Error(
    `Server at ${url} did not become ready within ${timeoutMs}ms`,
  );
}

async function startNuxtServer() {
  const serverEntry = path.resolve(".output/server/index.mjs");
  if (!fs.existsSync(serverEntry)) {
    console.log(
      "[Visual Test] .output/server/index.mjs not found. Building Nuxt node-server...",
    );
    execFileSync("npx", ["nuxt", "build"], {
      env: {
        ...process.env,
        NITRO_PRESET: "node-server",
        ENABLE_DESKTOP_BURGER_MENU: "true",
        NUXT_PUBLIC_ENABLE_DESKTOP_BURGER_MENU: "true",
      },
      stdio: "inherit",
    });
  }

  const port = await getAvailablePort();
  console.log(`[Visual Test] Starting Nuxt server on port ${port}...`);

  const serverProc = spawn("node", [serverEntry], {
    env: {
      ...process.env,
      PORT: String(port),
      NITRO_PORT: String(port),
      HOST: "127.0.0.1",
      ENABLE_DESKTOP_BURGER_MENU: "true",
      NUXT_PUBLIC_ENABLE_DESKTOP_BURGER_MENU: "true",
    },
    stdio: "pipe",
  });

  serverProc.on("error", (err) => {
    console.error("[Visual Test] Server spawn error:", err);
  });

  const targetUrl = `http://127.0.0.1:${port}`;
  console.log(`[Visual Test] Waiting for ${targetUrl} to become responsive...`);
  await waitForServer(targetUrl);
  console.log(`[Visual Test] Nuxt application ready at ${targetUrl}`);

  return { serverProc, targetUrl };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function readWorkState(page) {
  return page.evaluate(() => {
    const nav = document.querySelector(".navigation");
    const work = document.getElementById("work");
    const h1 = work?.querySelector("h1");
    const container = work?.querySelector(".container");
    const carousel = work?.querySelector(".carousel");
    return {
      url: window.location.href,
      scrollY: Math.round(window.scrollY),
      navBottom: nav ? nav.getBoundingClientRect().bottom : 0,
      workTop: work ? work.getBoundingClientRect().top : -1,
      h1Top: h1 ? h1.getBoundingClientRect().top : -1,
      containerOpacity: container ? getComputedStyle(container).opacity : null,
      carouselOpacity: carousel ? getComputedStyle(carousel).opacity : null,
      htmlOverflow: getComputedStyle(document.documentElement).overflowY,
      bodyOverflow: getComputedStyle(document.body).overflowY,
    };
  });
}

function assertWorkState(state, label) {
  assert(
    state.url.endsWith("/#work"),
    `${label}: expected /#work, got ${state.url}`,
  );
  assert(
    state.workTop >= state.navBottom - 1 && state.workTop <= 200,
    `${label}: #work covered or off-screen: ${JSON.stringify(state)}`,
  );
  assert(
    state.h1Top >= state.navBottom - 1 && state.h1Top <= 240,
    `${label}: #work h1 covered or off-screen: ${JSON.stringify(state)}`,
  );
  assert(
    state.containerOpacity === "1" && state.carouselOpacity === "1",
    `${label}: #work not revealed: ${JSON.stringify(state)}`,
  );
  assert(
    state.htmlOverflow !== "hidden" && state.bodyOverflow !== "hidden",
    `${label}: scroll still locked: ${JSON.stringify(state)}`,
  );
}

async function waitForWorkSettled(page) {
  await page.waitForFunction(
    () => {
      const work = document.getElementById("work");
      const nav = document.querySelector(".navigation");
      if (!work) return false;
      const container = work.querySelector(".container");
      const carousel = work.querySelector(".carousel");
      const workTop = work.getBoundingClientRect().top;
      const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
      const cOpacity = container ? getComputedStyle(container).opacity : "0";
      const carOpacity = carousel ? getComputedStyle(carousel).opacity : "0";
      return (
        window.location.hash === "#work" &&
        workTop >= navBottom - 1 &&
        workTop <= 200 &&
        cOpacity === "1" &&
        carOpacity === "1"
      );
    },
    null,
    { timeout: 6000 },
  );
  await page.waitForTimeout(300);
}

async function clickWorkInDrawer(page) {
  await page.click(".nav-mobile-toggle");
  await page.waitForSelector(".right-nav.is-visible", { timeout: 5000 });
  await page.waitForTimeout(450);
  await page.click('.right-nav .menu a[href$="#work"]');
  await waitForWorkSettled(page);
}

async function runVisualTest() {
  const opts = parseArgs();
  console.log("=== NunziellaSalluce Work Menu Anchor Visual Verification ===");

  fs.mkdirSync(opts.outDir, { recursive: true });
  fs.mkdirSync(opts.tempDir, { recursive: true });

  const videoDir = path.join(opts.tempDir, "recordings");
  if (fs.existsSync(videoDir)) {
    fs.rmSync(videoDir, { recursive: true, force: true });
  }
  fs.mkdirSync(videoDir, { recursive: true });

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
  let recordedVideoPath = null;

  try {
    // 1. Desktop Viewport (1280x800) with Video Recording
    console.log(
      "\n[1/3] Verifying Desktop Work Menu Anchor Flow (1280x800, Recording Video)...",
    );
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
      recordVideo: {
        dir: videoDir,
        size: { width: 1280, height: 800 },
      },
    });
    const desktopPage = await desktopContext.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    desktopPage.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    desktopPage.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    // 1a. Desktop / -> Work
    await desktopPage.goto(`${targetUrl}/`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(500);
    await clickWorkInDrawer(desktopPage);
    const d1 = await readWorkState(desktopPage);
    assertWorkState(d1, "Desktop / -> Work");

    const desktopPng = path.join(opts.outDir, "work-menu-anchor-desktop.png");
    await desktopPage.screenshot({ path: desktopPng });
    console.log(`✓ Saved: ${desktopPng}`);

    // 1b. Desktop /#work scrolled to bottom -> Work
    await desktopPage.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
    await desktopPage.waitForTimeout(500);
    await clickWorkInDrawer(desktopPage);
    assertWorkState(
      await readWorkState(desktopPage),
      "Desktop /#work (bottom) -> Work",
    );

    // 1c. Desktop /about -> Work
    await desktopPage.goto(`${targetUrl}/about`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(400);
    await clickWorkInDrawer(desktopPage);
    assertWorkState(await readWorkState(desktopPage), "Desktop /about -> Work");

    // 1d. Desktop direct /#work
    await desktopPage.goto(`${targetUrl}/#work`, { waitUntil: "networkidle" });
    await waitForWorkSettled(desktopPage);
    assertWorkState(await readWorkState(desktopPage), "Desktop direct /#work");

    await desktopPage.close();
    await desktopContext.close();

    assert(
      consoleErrors.length === 0 && pageErrors.length === 0,
      `Unexpected desktop errors: console=${JSON.stringify(consoleErrors)} page=${JSON.stringify(pageErrors)}`,
    );

    const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir) : [];
    if (videoFiles.length > 0) {
      recordedVideoPath = path.join(videoDir, videoFiles[0]);
      console.log(`✓ Raw WebM video captured: ${recordedVideoPath}`);
    }

    // 2. Mobile Viewport (390x844)
    console.log("\n[2/3] Verifying Mobile Work Menu Anchor Flow (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    const mobileConsoleErrors = [];
    const mobilePageErrors = [];
    mobilePage.on("console", (msg) => {
      if (msg.type() === "error") mobileConsoleErrors.push(msg.text());
    });
    mobilePage.on("pageerror", (err) => {
      mobilePageErrors.push(err.message);
    });

    // 2a. Mobile / -> Work
    await mobilePage.goto(`${targetUrl}/`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(500);
    await clickWorkInDrawer(mobilePage);
    assertWorkState(await readWorkState(mobilePage), "Mobile / -> Work");

    const mobilePng = path.join(opts.outDir, "work-menu-anchor-mobile.png");
    await mobilePage.screenshot({ path: mobilePng });
    console.log(`✓ Saved: ${mobilePng}`);

    // 2b. Mobile /about -> Work
    await mobilePage.goto(`${targetUrl}/about`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(400);
    await clickWorkInDrawer(mobilePage);
    assertWorkState(await readWorkState(mobilePage), "Mobile /about -> Work");

    // 2c. Mobile direct /#work
    await mobilePage.goto(`${targetUrl}/#work`, { waitUntil: "networkidle" });
    await waitForWorkSettled(mobilePage);
    assertWorkState(await readWorkState(mobilePage), "Mobile direct /#work");

    assert(
      mobileConsoleErrors.length === 0 && mobilePageErrors.length === 0,
      `Unexpected mobile errors: console=${JSON.stringify(mobileConsoleErrors)} page=${JSON.stringify(mobilePageErrors)}`,
    );

    await mobileContext.close();

    // 3. Encode H.264 MP4 walkthrough video
    if (recordedVideoPath && fs.existsSync(recordedVideoPath)) {
      console.log("\n[3/3] Encoding H.264 MP4 Walkthrough Video...");
      execFileSync(
        "ffmpeg",
        [
          "-y",
          "-i",
          recordedVideoPath,
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          "-crf",
          "23",
          "-vf",
          "scale=trunc(iw/2)*2:trunc(ih/2)*2",
          opts.mp4Path,
        ],
        { stdio: "inherit" },
      );
      console.log(`✓ H.264 MP4 walkthrough generated: ${opts.mp4Path}`);
    }

    console.log("\n✅ Work menu anchor visual verification passed.");
  } finally {
    await browser.close();
    if (serverProc) {
      serverProc.kill("SIGTERM");
    }
  }
}

runVisualTest().catch((err) => {
  console.error("\n❌ Visual verification failed:", err);
  process.exit(1);
});
