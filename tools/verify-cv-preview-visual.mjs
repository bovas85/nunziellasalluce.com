#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for Updated CV on About Page (#266)
 *
 * Runs an automated Playwright scenario against the authentic Nuxt application to visually verify:
 * 1. Desktop viewport (1280x800) loads /about with the updated CV preview image (WebP/PNG) and PDF download link
 * 2. The CV preview container (.cv-preview__container) is scrollable across both CV pages
 * 3. /NunziellaSalluce-CV.pdf responds with HTTP 200 and valid PDF bytes
 * 4. Mobile viewport (390x844) renders the scrollable CV preview cleanly without horizontal overflow
 * 5. H.264 MP4 walkthrough video (.github/assets/cv-preview-walkthrough.mp4) + PNG keyframes
 *
 * Usage:
 *   node tools/verify-cv-preview-visual.mjs
 *   node tools/verify-cv-preview-visual.mjs --url "http://127.0.0.1:3000"
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
    mp4Path: path.resolve(".github/assets/cv-preview-walkthrough.mp4"),
    tempDir: "/tmp/cv_preview_visual",
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
        ENABLE_CV_LIVE_PREVIEW: "true",
        NUXT_PUBLIC_ENABLE_CV_LIVE_PREVIEW: "true",
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
      ENABLE_CV_LIVE_PREVIEW: "true",
      NUXT_PUBLIC_ENABLE_CV_LIVE_PREVIEW: "true",
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

async function runVisualTest() {
  const opts = parseArgs();
  console.log("=== NunziellaSalluce Updated CV Visual Verification ===");

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
    // 1. Verify CV PDF endpoint directly
    console.log("\n[1/4] Verifying /NunziellaSalluce-CV.pdf asset...");
    const pdfRes = await fetch(`${targetUrl}/NunziellaSalluce-CV.pdf`);
    assert(pdfRes.ok, `Expected PDF 200 OK, got ${pdfRes.status}`);
    const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());
    const pdfMagic = Buffer.from(pdfBytes.slice(0, 5)).toString("ascii");
    assert(
      pdfMagic === "%PDF-",
      `Expected %PDF- header, got ${JSON.stringify(pdfMagic)}`,
    );
    console.log(
      `✓ /NunziellaSalluce-CV.pdf served (${pdfBytes.byteLength} bytes)`,
    );

    // 2. Desktop Viewport (1280x800) with Video Recording
    console.log(
      "\n[2/4] Verifying Desktop About Page & CV Preview (1280x800, Recording Video)...",
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

    await desktopPage.goto(`${targetUrl}/about`, { waitUntil: "networkidle" });
    await desktopPage.waitForSelector(".cv-preview__container", {
      state: "visible",
      timeout: 15000,
    });

    // Scroll page to reveal CV preview and download link
    await desktopPage.locator(".cv-preview").scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(800);

    // Ensure lazy image has finished loading
    await desktopPage.waitForFunction(() => {
      const img = document.querySelector("img.cv-preview__image");
      return Boolean(img && img.complete && img.naturalWidth > 0);
    });

    const desktopState = await desktopPage.evaluate(() => {
      const container = document.querySelector(".cv-preview__container");
      const img = document.querySelector("img.cv-preview__image");
      const source = document.querySelector(".cv-preview__container source");
      const link = document.querySelector("a.link");
      return {
        imgSrc: img?.getAttribute("src"),
        imgCurrentSrc: img?.currentSrc,
        naturalWidth: img?.naturalWidth || 0,
        naturalHeight: img?.naturalHeight || 0,
        sourceSrcset: source?.getAttribute("srcset"),
        linkHref: link?.getAttribute("href"),
        linkTarget: link?.getAttribute("target"),
        linkRel: link?.getAttribute("rel"),
        clientHeight: container?.clientHeight || 0,
        scrollHeight: container?.scrollHeight || 0,
      };
    });

    assert(
      desktopState.imgSrc === "/NunziellaSalluce-CV-preview.png",
      `Unexpected img src: ${desktopState.imgSrc}`,
    );
    assert(
      desktopState.sourceSrcset === "/NunziellaSalluce-CV-preview.webp",
      `Unexpected source srcset: ${desktopState.sourceSrcset}`,
    );
    assert(
      desktopState.naturalWidth === 1200 && desktopState.naturalHeight === 3402,
      `Expected 1200x3402 CV preview image, got ${desktopState.naturalWidth}x${desktopState.naturalHeight}`,
    );
    assert(
      desktopState.linkHref === "/NunziellaSalluce-CV.pdf" &&
        desktopState.linkTarget === "_blank" &&
        desktopState.linkRel === "noopener noreferrer",
      `Unexpected CV download link attributes: ${JSON.stringify(desktopState)}`,
    );
    assert(
      desktopState.scrollHeight > desktopState.clientHeight,
      `CV preview container must scroll (${desktopState.scrollHeight} <= ${desktopState.clientHeight})`,
    );

    const desktopTopPng = path.join(opts.outDir, "cv-preview-desktop-top.png");
    await desktopPage.screenshot({ path: desktopTopPng });
    console.log(`✓ Saved: ${desktopTopPng}`);

    // Smoothly scroll through Page 1 -> Page 2 inside the CV preview container
    const maxScroll = desktopState.scrollHeight - desktopState.clientHeight;
    for (let frac = 0.1; frac <= 1.0; frac += 0.1) {
      await desktopPage.evaluate(
        (top) => {
          const el = document.querySelector(".cv-preview__container");
          if (el) el.scrollTo({ top, behavior: "instant" });
        },
        Math.round(maxScroll * frac),
      );
      await desktopPage.waitForTimeout(200);
    }
    await desktopPage.waitForTimeout(600);

    const desktopScrolledPng = path.join(
      opts.outDir,
      "cv-preview-desktop-scrolled.png",
    );
    await desktopPage.screenshot({ path: desktopScrolledPng });
    console.log(`✓ Saved: ${desktopScrolledPng}`);

    await desktopPage.close();
    await desktopContext.close();

    assert(
      consoleErrors.length === 0 && pageErrors.length === 0,
      `Unexpected browser errors: console=${JSON.stringify(consoleErrors)} page=${JSON.stringify(pageErrors)}`,
    );

    const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir) : [];
    if (videoFiles.length > 0) {
      recordedVideoPath = path.join(videoDir, videoFiles[0]);
      console.log(`✓ Raw WebM video captured: ${recordedVideoPath}`);
    }

    // 3. Mobile Viewport (390x844)
    console.log("\n[3/4] Verifying Mobile Viewport (390x844)...");
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

    await mobilePage.goto(`${targetUrl}/about`, { waitUntil: "networkidle" });
    await mobilePage.waitForSelector(".cv-preview__container", {
      state: "visible",
      timeout: 15000,
    });
    await mobilePage.locator(".cv-preview").scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(700);
    await mobilePage.waitForFunction(() => {
      const img = document.querySelector("img.cv-preview__image");
      return Boolean(img && img.complete && img.naturalWidth > 0);
    });

    const mobileState = await mobilePage.evaluate(() => {
      const container = document.querySelector(".cv-preview__container");
      const img = document.querySelector("img.cv-preview__image");
      return {
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        naturalWidth: img?.naturalWidth || 0,
        clientHeight: container?.clientHeight || 0,
        scrollHeight: container?.scrollHeight || 0,
      };
    });
    assert(
      mobileState.docScrollWidth <= mobileState.innerWidth,
      `Mobile horizontal overflow detected: ${mobileState.docScrollWidth} > ${mobileState.innerWidth}`,
    );
    assert(
      mobileState.naturalWidth === 1200 &&
        mobileState.scrollHeight > mobileState.clientHeight,
      `Mobile CV preview invalid: ${JSON.stringify(mobileState)}`,
    );

    const mobilePng = path.join(opts.outDir, "cv-preview-mobile.png");
    await mobilePage.screenshot({ path: mobilePng });
    console.log(`✓ Saved: ${mobilePng}`);

    assert(
      mobileConsoleErrors.length === 0 && mobilePageErrors.length === 0,
      `Unexpected mobile browser errors: console=${JSON.stringify(mobileConsoleErrors)} page=${JSON.stringify(mobilePageErrors)}`,
    );

    await mobileContext.close();

    // 4. Encode H.264 MP4 walkthrough video
    if (recordedVideoPath && fs.existsSync(recordedVideoPath)) {
      console.log("\n[4/4] Encoding H.264 MP4 Walkthrough Video...");
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

    console.log("\n✅ Updated CV visual verification passed.");
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
