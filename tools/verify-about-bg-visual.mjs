#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for About Background Image Quality (#273)
 *
 * Runs an automated Playwright scenario against the authentic Nuxt application to visually verify:
 * 1. Desktop (1280x800) loads high-resolution desktop portrait without zoomImage upscaling
 * 2. Desktop background image container is bounded to viewport height with smooth gradient fade
 * 3. Mobile (390x844) does NOT load the 15 KB Bio-Nunziella-Salluce-Design-mobile.jpg.webp
 * 4. Mobile background image container is bounded and framed cleanly without vertical stretching
 * 5. H.264 MP4 walkthrough video (.github/assets/about-bg-walkthrough.mp4) + PNG keyframes
 *
 * Usage:
 *   node tools/verify-about-bg-visual.mjs
 *   node tools/verify-about-bg-visual.mjs --url "http://127.0.0.1:3000"
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
    mp4Path: path.resolve(".github/assets/about-bg-walkthrough.mp4"),
    tempDir: "/tmp/about_bg_visual",
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
  console.log("[Visual Test] Building Nuxt node-server...");
  execFileSync("npx", ["nuxt", "build"], {
    env: {
      ...process.env,
      NITRO_PRESET: "node-server",
      ENABLE_ABOUT_BG_QUALITY_FIX: "true",
      NUXT_PUBLIC_ENABLE_ABOUT_BG_QUALITY_FIX: "true",
    },
    stdio: "inherit",
  });

  const port = await getAvailablePort();
  console.log(`[Visual Test] Starting Nuxt server on port ${port}...`);

  const serverProc = spawn("node", [serverEntry], {
    env: {
      ...process.env,
      PORT: String(port),
      NITRO_PORT: String(port),
      HOST: "127.0.0.1",
      ENABLE_ABOUT_BG_QUALITY_FIX: "true",
      NUXT_PUBLIC_ENABLE_ABOUT_BG_QUALITY_FIX: "true",
    },
    stdio: "pipe",
  });

  serverProc.on("error", (err) => {
    console.error("[Visual Test] Server spawn error:", err);
  });

  const targetUrl = `http://127.0.0.1:${port}`;
  console.log(`[Visual Test] Waiting for ${targetUrl} to become responsive...`);
  await waitForServer(targetUrl);
  return { serverProc, targetUrl };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function runVisualTest() {
  const opts = parseArgs();
  fs.mkdirSync(opts.outDir, { recursive: true });
  fs.rmSync(opts.tempDir, { recursive: true, force: true });
  fs.mkdirSync(opts.tempDir, { recursive: true });

  let serverProc = null;
  let baseUrl = opts.url;

  if (!baseUrl) {
    const started = await startNuxtServer();
    serverProc = started.serverProc;
    baseUrl = started.targetUrl;
  }

  const aboutUrl = `${baseUrl}/about`;
  const videoDir = path.join(opts.tempDir, "video");
  fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Viewport (1280x800) with video recording
    console.log("\n[1/3] Verifying Desktop Viewport (1280x800)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } },
    });
    const desktopPage = await desktopContext.newPage();
    const desktopConsoleErrors = [];
    const desktopPageErrors = [];
    desktopPage.on("console", (msg) => {
      if (msg.type() === "error") desktopConsoleErrors.push(msg.text());
    });
    desktopPage.on("pageerror", (err) => {
      desktopPageErrors.push(err.message);
    });

    await desktopPage.goto(aboutUrl, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(800);

    const desktopState = await desktopPage.evaluate(() => {
      const root = document.querySelector(".app > .about");
      const bgBox = root ? root.querySelector(".image") : null;
      const img = bgBox ? bgBox.querySelector("img") : null;
      const rootRect = root ? root.getBoundingClientRect() : null;
      const bgRect = bgBox ? bgBox.getBoundingClientRect() : null;
      const imgCs = img ? getComputedStyle(img) : null;
      return {
        hasFixClass: Boolean(root?.classList.contains("about--bg-quality-fix")),
        rootHeight: rootRect ? Math.round(rootRect.height) : 0,
        bgHeight: bgRect ? Math.round(bgRect.height) : 0,
        naturalWidth: img ? img.naturalWidth : 0,
        naturalHeight: img ? img.naturalHeight : 0,
        currentSrc: img ? img.currentSrc : "",
        animationName: imgCs ? imgCs.animationName : "",
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });

    console.log("Desktop state:", JSON.stringify(desktopState, null, 2));
    assert(
      desktopState.hasFixClass,
      "Desktop .about missing about--bg-quality-fix",
    );
    assert(
      desktopState.naturalWidth >= 1600 && desktopState.naturalHeight >= 1000,
      `Desktop natural dimensions too low: ${desktopState.naturalWidth}x${desktopState.naturalHeight}`,
    );
    assert(
      !desktopState.currentSrc.includes(
        "Bio-Nunziella-Salluce-Design-mobile",
      ) && !desktopState.currentSrc.endsWith(".webp"),
      `Desktop should use full JPEG asset without aggressive WebP: ${desktopState.currentSrc}`,
    );
    assert(
      desktopState.bgHeight > 0 &&
        desktopState.bgHeight <= 800 &&
        desktopState.bgHeight < desktopState.rootHeight,
      `Desktop .image height should be bounded to 100vh (<=800px), got ${desktopState.bgHeight} of ${desktopState.rootHeight}`,
    );
    assert(
      desktopState.animationName === "none",
      `Desktop zoomImage animation should be disabled on About, got ${desktopState.animationName}`,
    );
    assert(
      desktopState.scrollWidth <= desktopState.innerWidth,
      `Desktop horizontal overflow: ${desktopState.scrollWidth} > ${desktopState.innerWidth}`,
    );

    const desktopPng = path.join(opts.outDir, "about-bg-desktop.png");
    await desktopPage.screenshot({ path: desktopPng });
    console.log(`✓ Saved: ${desktopPng}`);

    for (let y = 0; y <= 900; y += 150) {
      await desktopPage.evaluate((top) => window.scrollTo(0, top), y);
      await desktopPage.waitForTimeout(180);
    }
    await desktopPage.waitForTimeout(500);

    const desktopScrolledPng = path.join(
      opts.outDir,
      "about-bg-desktop-scrolled.png",
    );
    await desktopPage.screenshot({ path: desktopScrolledPng });
    console.log(`✓ Saved: ${desktopScrolledPng}`);

    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(400);

    const videoObj = desktopPage.video();
    await desktopPage.close();
    const recordedVideoPath = videoObj ? await videoObj.path() : null;
    await desktopContext.close();

    assert(
      desktopConsoleErrors.length === 0 && desktopPageErrors.length === 0,
      `Unexpected desktop browser errors: console=${JSON.stringify(desktopConsoleErrors)} page=${JSON.stringify(desktopPageErrors)}`,
    );

    // 2. Mobile Viewport (390x844)
    console.log("\n[2/3] Verifying Mobile Viewport (390x844)...");
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

    await mobilePage.goto(aboutUrl, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(800);

    const mobileState = await mobilePage.evaluate(() => {
      const root = document.querySelector(".app > .about");
      const bgBox = root ? root.querySelector(".image") : null;
      const img = bgBox ? bgBox.querySelector("img") : null;
      const rootRect = root ? root.getBoundingClientRect() : null;
      const bgRect = bgBox ? bgBox.getBoundingClientRect() : null;
      const imgCs = img ? getComputedStyle(img) : null;
      return {
        hasFixClass: Boolean(root?.classList.contains("about--bg-quality-fix")),
        rootHeight: rootRect ? Math.round(rootRect.height) : 0,
        bgHeight: bgRect ? Math.round(bgRect.height) : 0,
        naturalWidth: img ? img.naturalWidth : 0,
        naturalHeight: img ? img.naturalHeight : 0,
        currentSrc: img ? img.currentSrc : "",
        objectPosition: imgCs ? imgCs.objectPosition : "",
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });

    console.log("Mobile state:", JSON.stringify(mobileState, null, 2));
    assert(
      mobileState.hasFixClass,
      "Mobile .about missing about--bg-quality-fix",
    );
    assert(
      mobileState.naturalWidth >= 1600 && mobileState.naturalHeight >= 1000,
      `Mobile natural dimensions too low: ${mobileState.naturalWidth}x${mobileState.naturalHeight}`,
    );
    assert(
      !mobileState.currentSrc.includes("Bio-Nunziella-Salluce-Design-mobile") &&
        !mobileState.currentSrc.endsWith(".webp"),
      `Mobile should NOT serve 15KB mobile WebP: ${mobileState.currentSrc}`,
    );
    assert(
      mobileState.bgHeight > 0 &&
        mobileState.bgHeight <= 760 &&
        mobileState.bgHeight < mobileState.rootHeight,
      `Mobile .image height should be bounded (<=760px), got ${mobileState.bgHeight} of ${mobileState.rootHeight}`,
    );
    assert(
      mobileState.objectPosition === "75% 50%",
      `Mobile image objectPosition should center portrait at 75% 50%, got ${mobileState.objectPosition}`,
    );
    assert(
      mobileState.scrollWidth <= mobileState.innerWidth,
      `Mobile horizontal overflow: ${mobileState.scrollWidth} > ${mobileState.innerWidth}`,
    );

    const mobilePng = path.join(opts.outDir, "about-bg-mobile.png");
    await mobilePage.screenshot({ path: mobilePng });
    console.log(`✓ Saved: ${mobilePng}`);

    for (let y = 0; y <= 750; y += 150) {
      await mobilePage.evaluate((top) => window.scrollTo(0, top), y);
      await mobilePage.waitForTimeout(150);
    }
    await mobilePage.waitForTimeout(500);

    const mobileScrolledPng = path.join(
      opts.outDir,
      "about-bg-mobile-scrolled.png",
    );
    await mobilePage.screenshot({ path: mobileScrolledPng });
    console.log(`✓ Saved: ${mobileScrolledPng}`);

    assert(
      mobileConsoleErrors.length === 0 && mobilePageErrors.length === 0,
      `Unexpected mobile browser errors: console=${JSON.stringify(mobileConsoleErrors)} page=${JSON.stringify(mobilePageErrors)}`,
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

    console.log("\n✅ About background quality visual verification passed.");
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
