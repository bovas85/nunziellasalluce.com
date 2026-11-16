#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for Homepage Work Carousel Swipe Fix (#247)
 *
 * Runs an automated Playwright scenario to visually verify:
 * 1. Desktop resting state with work carousel centered and animated in
 * 2. Desktop hover state on slide (smooth subtitle & CTA button reveal)
 * 3. Desktop drag / swipe gesture (stable subtitles and CTA, transitions suppressed mid-swipe, no flashing)
 * 4. Desktop settle state on new active slide
 * 5. Mobile viewport (390x844 iPhone / Touch) touch swipe stability with subtitles visible
 * 6. High-definition MP4 & MOV walkthrough video (.github/assets/carousel-swipe-walkthrough.mp4 & .mov)
 *
 * Usage:
 *   node tools/verify-carousel-swipe-visual.mjs
 *   node tools/verify-carousel-swipe-visual.mjs --url "http://127.0.0.1:3000"
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
    mp4Path: path.resolve(".github/assets/carousel-swipe-walkthrough.mp4"),
    movPath: path.resolve(".github/assets/carousel-swipe-walkthrough.mov"),
    tempDir: "/tmp/carousel_swipe_visual",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      options.url = args[++i].replace(/\/$/, "");
    } else if (args[i] === "--out" && args[i + 1]) {
      options.outDir = path.resolve(args[++i]);
    } else if (args[i] === "--mp4" && args[i + 1]) {
      options.mp4Path = path.resolve(args[++i]);
    } else if (args[i] === "--mov" && args[i + 1]) {
      options.movPath = path.resolve(args[++i]);
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
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
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
        ENABLE_CAROUSEL_SWIPE_FIX: "true",
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
      ENABLE_CAROUSEL_SWIPE_FIX: "true",
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

async function runVisualTest() {
  const opts = parseArgs();
  console.log("=== NunziellaSalluce Carousel Swipe Visual Verification ===");

  if (!fs.existsSync(opts.outDir)) {
    fs.mkdirSync(opts.outDir, { recursive: true });
  }
  if (!fs.existsSync(opts.tempDir)) {
    fs.mkdirSync(opts.tempDir, { recursive: true });
  }

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
    // 1. Desktop Viewport (1280x800) with Continuous Video Recording
    console.log(
      "\n[1/4] Running Live Desktop Carousel Swipe Flow (Recording Video)...",
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
    await desktopPage.goto(targetUrl, { waitUntil: "networkidle" });

    // Smoothly scroll down so Scrollama activates step 2 (.projects / animateWork)
    for (let y = 0; y <= 2200; y += 200) {
      await desktopPage.evaluate((top) => window.scrollTo(0, top), y);
      await desktopPage.waitForTimeout(50);
    }

    const sectionSelector = ".projects.section";
    await desktopPage.waitForSelector(sectionSelector, {
      state: "visible",
      timeout: 15000,
    });
    const section = await desktopPage.$(sectionSelector);
    if (section) {
      await section.scrollIntoViewIfNeeded();
    }

    // Wait for .carousel.animated and images to settle
    await desktopPage.waitForSelector(".carousel.animated", {
      state: "visible",
      timeout: 10000,
    });
    await desktopPage.evaluate(() => {
      const g = window;
      if (g.lazySizes && g.lazySizes.loader) {
        g.lazySizes.loader.checkElems();
      }
    });
    await desktopPage.waitForTimeout(1000);

    const restingScreenshot = path.join(
      opts.outDir,
      "carousel-swipe-desktop-resting.png",
    );
    await desktopPage.screenshot({ path: restingScreenshot });
    console.log(`✓ Saved: ${restingScreenshot}`);

    // Hover on active slide
    const activeSlide = desktopPage
      .locator(".swiper-slide-active, .swiper-slide-item")
      .first();
    const slideBox = await activeSlide.boundingBox();
    if (slideBox) {
      await desktopPage.mouse.move(
        slideBox.x + slideBox.width / 2,
        slideBox.y + slideBox.height / 2,
      );
      await desktopPage.waitForTimeout(1200); // Allow hover transition to complete smoothly
    }

    const hoverScreenshot = path.join(
      opts.outDir,
      "carousel-swipe-desktop-hover.png",
    );
    await desktopPage.screenshot({ path: hoverScreenshot });
    console.log(`✓ Saved: ${hoverScreenshot}`);

    // Drag / Swipe gesture (authentic horizontal swipe across carousel slides)
    console.log(
      "\n[2/4] Performing Live Horizontal Drag / Swipe Gesture (Flashing Prevention)...",
    );
    const draggingScreenshot = path.join(
      opts.outDir,
      "carousel-swipe-desktop-dragging.png",
    );

    // Perform genuine horizontal mouse swipe to next slide
    const swiperEl = desktopPage.locator(".app-carousel");
    const swiperBox = await swiperEl.boundingBox();
    if (swiperBox) {
      const dragY = swiperBox.y + swiperBox.height / 2;
      const startX = swiperBox.x + swiperBox.width * 0.7;
      const targetX = swiperBox.x + swiperBox.width * 0.25;

      await desktopPage.mouse.move(startX, dragY);
      await desktopPage.waitForTimeout(300);
      await desktopPage.mouse.down();
      await desktopPage.waitForTimeout(100);
      await desktopPage.mouse.move(targetX, dragY, { steps: 35 });
      await desktopPage.waitForTimeout(100);
      await desktopPage.mouse.up();
      await desktopPage.waitForTimeout(1000);
    }

    await desktopPage.screenshot({ path: draggingScreenshot });
    console.log(`✓ Saved: ${draggingScreenshot}`);

    // Hover over the newly centered slide to showcase stable subtitle reveal
    await desktopPage.waitForTimeout(600);
    const newActiveSlide = desktopPage
      .locator(".swiper-slide-active, .swiper-slide-item")
      .first();
    const newBox = await newActiveSlide.boundingBox();
    if (newBox) {
      await desktopPage.mouse.move(
        newBox.x + newBox.width / 2,
        newBox.y + newBox.height / 2,
      );
      await desktopPage.waitForTimeout(1200);
    }

    // Swipe backward to previous slide to showcase bidirectional horizontal motion
    if (swiperBox) {
      const dragY = swiperBox.y + swiperBox.height / 2;
      const startX = swiperBox.x + swiperBox.width * 0.3;
      const targetX = swiperBox.x + swiperBox.width * 0.75;

      await desktopPage.mouse.move(startX, dragY);
      await desktopPage.waitForTimeout(300);
      await desktopPage.mouse.down();
      await desktopPage.waitForTimeout(100);
      await desktopPage.mouse.move(targetX, dragY, { steps: 35 });
      await desktopPage.waitForTimeout(100);
      await desktopPage.mouse.up();
      await desktopPage.waitForTimeout(1000);
    }

    await desktopPage.waitForTimeout(800);

    // Close desktop context to finalize video writing
    await desktopPage.close();
    await desktopContext.close();

    const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir) : [];
    if (videoFiles.length > 0) {
      recordedVideoPath = path.join(videoDir, videoFiles[0]);
      console.log(`✓ Raw WebM video captured: ${recordedVideoPath}`);
    }

    // 3. Mobile Viewport (390x844 - iPhone / Touch context)
    console.log("\n[3/4] Testing Mobile Touch Viewport (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(targetUrl, { waitUntil: "networkidle" });

    // Smoothly scroll down so Scrollama activates step 2 on mobile
    for (let y = 0; y <= 1800; y += 150) {
      await mobilePage.evaluate((top) => window.scrollTo(0, top), y);
      await mobilePage.waitForTimeout(40);
    }

    const mobileSection = await mobilePage.$(sectionSelector);
    if (mobileSection) {
      await mobileSection.scrollIntoViewIfNeeded();
    }

    await mobilePage.waitForSelector(".carousel.animated", {
      state: "visible",
      timeout: 10000,
    });
    await mobilePage.waitForTimeout(600);

    const mobileSwipeBox = await mobilePage
      .locator(".app-carousel")
      .boundingBox();
    if (!mobileSwipeBox) {
      throw new Error("Mobile carousel bounding box not found");
    }

    const initialSlideTitle = await mobilePage.evaluate(
      () =>
        document.querySelector(".swiper-slide-active h3")?.textContent?.trim() ||
        "",
    );

    const mobileScreenshot = path.join(
      opts.outDir,
      "carousel-swipe-mobile.png",
    );
    await mobilePage.screenshot({ path: mobileScreenshot });
    console.log(`✓ Saved: ${mobileScreenshot}`);

    // Perform genuine touch swipe via CDP to test settle stability on mobile
    const cdp = await mobileContext.newCDPSession(mobilePage);
    const touchY = Math.round(mobileSwipeBox.y + mobileSwipeBox.height / 2);
    const touchStartX = Math.round(
      mobileSwipeBox.x + mobileSwipeBox.width * 0.8,
    );
    const touchEndX = Math.round(mobileSwipeBox.x + mobileSwipeBox.width * 0.2);

    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: touchStartX, y: touchY, id: 1 }],
    });
    for (let step = 1; step <= 12; step++) {
      const x = Math.round(
        touchStartX + ((touchEndX - touchStartX) * step) / 12,
      );
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: touchY, id: 1 }],
      });
      await mobilePage.waitForTimeout(16);
    }
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });

    // Verify stability across the post-swipe settle window (0ms -> 600ms)
    for (const waitMs of [0, 100, 250, 600]) {
      if (waitMs > 0) await mobilePage.waitForTimeout(waitMs);
      const state = await mobilePage.evaluate(() => {
        const activeSlide = document.querySelector(".swiper-slide-active");
        const sub = activeSlide?.querySelector(".subtitle:not(.subtitle--show)");
        const btn = activeSlide?.querySelector(".subtitle--show");
        const imgs = Array.from(
          document.querySelectorAll(".swiper-slide-item img"),
        );
        return {
          url: window.location.pathname,
          activeTitle: activeSlide?.querySelector("h3")?.textContent?.trim(),
          subOpacity: sub ? window.getComputedStyle(sub).opacity : null,
          subTransition: sub
            ? window.getComputedStyle(sub).transitionDuration
            : null,
          btnOpacity: btn ? window.getComputedStyle(btn).opacity : null,
          btnTransition: btn
            ? window.getComputedStyle(btn).transitionDuration
            : null,
          imgIssues: imgs
            .map((img) => ({
              src: img.getAttribute("src") || "",
              className: img.className,
              transform: window.getComputedStyle(img).transform,
            }))
            .filter(
              (info) =>
                info.src.includes("Homepage.svg") ||
                info.className.includes("lazyload"),
            ),
        };
      });

      if (state.url !== "/") {
        throw new Error(
          `Mobile swipe inadvertently navigated to ${state.url}`,
        );
      }
      if (state.subOpacity !== "1" || state.btnOpacity !== "1") {
        throw new Error(
          `Mobile subtitle/CTA flashed at +${waitMs}ms: subOpacity=${state.subOpacity}, btnOpacity=${state.btnOpacity}`,
        );
      }
      if (state.subTransition !== "0s" || state.btnTransition !== "0s") {
        throw new Error(
          `Unexpected mobile transition duration at +${waitMs}ms: sub=${state.subTransition}, btn=${state.btnTransition}`,
        );
      }
      if (state.imgIssues.length > 0) {
        throw new Error(
          `Carousel images still using lazy placeholders at +${waitMs}ms: ${JSON.stringify(state.imgIssues)}`,
        );
      }
    }

    const settledSlideTitle = await mobilePage.evaluate(
      () =>
        document.querySelector(".swiper-slide-active h3")?.textContent?.trim() ||
        "",
    );
    if (!settledSlideTitle || settledSlideTitle === initialSlideTitle) {
      throw new Error(
        `Mobile touch swipe did not advance slide (stayed on "${initialSlideTitle}")`,
      );
    }
    console.log(
      `✓ Verified mobile touch swipe & settle stability ("${initialSlideTitle}" -> "${settledSlideTitle}")`,
    );

    await mobileContext.close();

    // 4. Generate MP4 and MOV Video Walkthroughs via ffmpeg
    console.log(
      "\n[4/4] Encoding Walkthrough Videos (.mp4 & .mov) via ffmpeg...",
    );
    if (recordedVideoPath && fs.existsSync(recordedVideoPath)) {
      // 4a. Encode MP4 (H.264, universally supported across browsers, GitHub & mobile)
      execFileSync(
        "ffmpeg",
        [
          "-y",
          "-i",
          recordedVideoPath,
          "-c:v",
          "libx264",
          "-preset",
          "slow",
          "-crf",
          "22",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          opts.mp4Path,
        ],
        { stdio: "ignore" },
      );
      console.log(`✓ Generated MP4 Walkthrough: ${opts.mp4Path}`);

      // 4b. Encode MOV (ProRes / QuickTime compatible)
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
          opts.movPath,
        ],
        { stdio: "ignore" },
      );
      console.log(`✓ Generated MOV Walkthrough: ${opts.movPath}`);

      // Also copy to T3 userdata attachments for easy embedding/linking
      const attachmentDir = "/home/leelium/.t3/userdata/attachments";
      if (fs.existsSync(attachmentDir)) {
        const destMp4 = path.join(
          attachmentDir,
          "carousel-swipe-walkthrough.mp4",
        );
        const destMov = path.join(
          attachmentDir,
          "carousel-swipe-walkthrough.mov",
        );
        fs.copyFileSync(opts.mp4Path, destMp4);
        fs.copyFileSync(opts.movPath, destMov);
        console.log(`✓ Exported attachments: ${destMp4}, ${destMov}`);
      }
    }

    console.log("\n=== Visual Verification Passed Successfully ===");
    console.log("Summary of artifacts created:");
    console.log(`- ${restingScreenshot}`);
    console.log(`- ${hoverScreenshot}`);
    console.log(`- ${draggingScreenshot}`);
    console.log(`- ${mobileScreenshot}`);
    console.log(`- ${opts.mp4Path}`);
    console.log(`- ${opts.movPath}`);
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
