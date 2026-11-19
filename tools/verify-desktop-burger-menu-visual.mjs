#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for Desktop Burger Menu (#263)
 *
 * Runs an automated Playwright scenario against the authentic Nuxt application to visually verify:
 * 1. Desktop viewport (1280x800) shows the burger menu toggle instead of horizontal desktop links
 * 2. Clicking the desktop burger toggle opens the full navigation drawer with visible orange social icons
 * 3. Desktop scrolled state keeps the burger menu toggle accessible in the sticky header
 * 4. Mobile viewport (390x844) continues to toggle the navigation drawer cleanly
 * 5. H.264 MP4 walkthrough video (.github/assets/desktop-burger-menu-walkthrough.mp4) + PNG keyframes
 *
 * Usage:
 *   node tools/verify-desktop-burger-menu-visual.mjs
 *   node tools/verify-desktop-burger-menu-visual.mjs --url "http://127.0.0.1:3000"
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
    mp4Path: path.resolve(".github/assets/desktop-burger-menu-walkthrough.mp4"),
    tempDir: "/tmp/desktop_burger_menu_visual",
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

async function runVisualTest() {
  const opts = parseArgs();
  console.log(
    "=== NunziellaSalluce Desktop Burger Menu Visual Verification ===",
  );

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
      "\n[1/4] Verifying Desktop Burger Menu Flow (1280x800, Recording Video)...",
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

    await desktopPage.goto(targetUrl, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(700);

    const desktopInitial = await desktopPage.evaluate(() => {
      const nav = document.querySelector(".navigation");
      const toggle = document.querySelector(".nav-mobile-toggle");
      const desktopNav = document.querySelector(".nav-desktop");
      const rect = toggle ? toggle.getBoundingClientRect() : null;
      return {
        navBg: nav ? getComputedStyle(nav).backgroundColor : null,
        toggleExists: Boolean(toggle),
        toggleDisplay: toggle ? getComputedStyle(toggle).display : null,
        toggleWidth: rect ? rect.width : 0,
        toggleHeight: rect ? rect.height : 0,
        desktopNavExists: Boolean(desktopNav),
        awwwardsBadgeExists: Boolean(document.querySelector("#awwwards")),
      };
    });

    assert(
      desktopInitial.navBg === "rgba(0, 0, 0, 0)",
      `Desktop nav background must start transparent, got ${desktopInitial.navBg}`,
    );
    assert(
      !desktopInitial.awwwardsBadgeExists,
      "Floating #awwwards nominee badge must not render on home",
    );
    assert(desktopInitial.toggleExists, "Desktop burger toggle must exist");
    assert(
      desktopInitial.toggleDisplay !== "none" &&
        desktopInitial.toggleWidth > 0 &&
        desktopInitial.toggleHeight > 0,
      `Desktop burger toggle must be visible, got ${JSON.stringify(desktopInitial)}`,
    );
    assert(
      !desktopInitial.desktopNavExists,
      "Horizontal desktop links (.nav-desktop) must not render when enableDesktopBurgerMenu is enabled",
    );

    const desktopClosedPng = path.join(
      opts.outDir,
      "burger-menu-desktop-closed.png",
    );
    await desktopPage.screenshot({ path: desktopClosedPng });
    console.log(`✓ Saved: ${desktopClosedPng}`);

    // Verify no horizontal overflow when drawer is closed off-screen
    const desktopOverflowClosed = await desktopPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert(
      desktopOverflowClosed.scrollWidth <= desktopOverflowClosed.innerWidth,
      `Desktop closed drawer caused horizontal overflow: ${JSON.stringify(desktopOverflowClosed)}`,
    );

    // Click burger menu on desktop to open drawer and verify smooth slide-in animation
    await desktopPage.click(".nav-mobile-toggle");
    await desktopPage.waitForTimeout(220);
    const desktopMidOpen = await desktopPage.evaluate(() => {
      const drawer = document.querySelector(".right-nav");
      const transform = drawer ? getComputedStyle(drawer).transform : "none";
      const tx =
        transform && transform !== "none"
          ? new DOMMatrixReadOnly(transform).m41
          : 0;
      return {
        visibility: drawer ? getComputedStyle(drawer).visibility : null,
        tx,
        innerWidth: window.innerWidth,
      };
    });
    assert(
      desktopMidOpen.visibility === "visible" &&
        desktopMidOpen.tx > 10 &&
        desktopMidOpen.tx < desktopMidOpen.innerWidth,
      `Desktop drawer should slide smoothly rather than snap open: ${JSON.stringify(desktopMidOpen)}`,
    );

    await desktopPage.waitForTimeout(700);

    const desktopOpen = await desktopPage.evaluate(() => {
      const toggle = document.querySelector(".nav-mobile-toggle");
      const drawer = document.querySelector(".right-nav");
      const social = document.querySelector(".right-nav .social--behance");
      return {
        ariaExpanded: toggle?.getAttribute("aria-expanded"),
        drawerVisibility: drawer ? getComputedStyle(drawer).visibility : null,
        drawerWidth: drawer ? drawer.getBoundingClientRect().width : 0,
        socialBgPos: social
          ? getComputedStyle(social).backgroundPosition
          : null,
      };
    });

    assert(
      desktopOpen.ariaExpanded === "true",
      "Burger toggle aria-expanded must be true when open",
    );
    assert(
      desktopOpen.drawerVisibility === "visible" && desktopOpen.drawerWidth > 0,
      `Desktop drawer must be visible when open, got ${JSON.stringify(desktopOpen)}`,
    );
    assert(
      desktopOpen.socialBgPos?.includes("-24px"),
      `Desktop drawer social icons must remain orange (-24px), got ${desktopOpen.socialBgPos}`,
    );

    const desktopOpenPng = path.join(
      opts.outDir,
      "burger-menu-desktop-open.png",
    );
    await desktopPage.screenshot({ path: desktopOpenPng });
    console.log(`✓ Saved: ${desktopOpenPng}`);

    // Close drawer via toggle button and verify smooth slide-out animation
    await desktopPage.click(".nav-mobile-toggle");
    await desktopPage.waitForTimeout(220);
    const desktopMidClose = await desktopPage.evaluate(() => {
      const drawer = document.querySelector(".right-nav");
      const transform = drawer ? getComputedStyle(drawer).transform : "none";
      const tx =
        transform && transform !== "none"
          ? new DOMMatrixReadOnly(transform).m41
          : 0;
      return {
        visibility: drawer ? getComputedStyle(drawer).visibility : null,
        tx,
      };
    });
    assert(
      desktopMidClose.visibility === "visible" && desktopMidClose.tx > 10,
      `Desktop drawer should slide out smoothly rather than vanish abruptly: ${JSON.stringify(desktopMidClose)}`,
    );
    await desktopPage.waitForTimeout(700);
    const desktopClosedVis = await desktopPage.evaluate(() => {
      const drawer = document.querySelector(".right-nav");
      return drawer ? getComputedStyle(drawer).visibility : null;
    });
    assert(
      desktopClosedVis === "hidden",
      `Desktop drawer should become hidden after close animation, got ${desktopClosedVis}`,
    );

    // Scroll down to verify sticky header with burger toggle on desktop
    console.log("\n[2/4] Verifying Desktop Scrolled Sticky Header...");
    for (let y = 0; y <= 600; y += 150) {
      await desktopPage.evaluate((top) => window.scrollTo(0, top), y);
      await desktopPage.waitForTimeout(60);
    }
    await desktopPage.waitForTimeout(1200);

    const scrolledToggle = await desktopPage.evaluate(() => {
      const nav = document.querySelector(".navigation");
      const toggle = document.querySelector(".nav-mobile-toggle");
      const rect = toggle ? toggle.getBoundingClientRect() : null;
      return {
        navPosition: nav ? getComputedStyle(nav).position : null,
        navBg: nav ? getComputedStyle(nav).backgroundColor : null,
        navShadow: nav ? getComputedStyle(nav).boxShadow : null,
        hasScrolledDone: Boolean(
          nav?.classList.contains("scrolled") &&
          nav?.classList.contains("done"),
        ),
        toggleTop: rect ? rect.top : -1,
        toggleVisible: rect ? rect.width > 0 && rect.height > 0 : false,
      };
    });
    assert(
      scrolledToggle.navPosition === "fixed" &&
        scrolledToggle.hasScrolledDone &&
        scrolledToggle.navBg === "rgb(231, 231, 231)" &&
        scrolledToggle.navShadow !== "none" &&
        scrolledToggle.toggleVisible &&
        scrolledToggle.toggleTop >= 0,
      `Scrolled sticky header on desktop must change background to #e7e7e7 and stay visible, got ${JSON.stringify(scrolledToggle)}`,
    );

    const desktopScrolledPng = path.join(
      opts.outDir,
      "burger-menu-desktop-scrolled.png",
    );
    await desktopPage.screenshot({ path: desktopScrolledPng });
    console.log(`✓ Saved: ${desktopScrolledPng}`);

    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(800);
    const desktopResetBg = await desktopPage.evaluate(() => {
      const nav = document.querySelector(".navigation");
      return nav ? getComputedStyle(nav).backgroundColor : null;
    });
    assert(
      desktopResetBg === "rgba(0, 0, 0, 0)",
      `Desktop nav background must reset to transparent at top, got ${desktopResetBg}`,
    );

    // Navigate to About via burger drawer on desktop
    await desktopPage.click(".nav-mobile-toggle");
    await desktopPage.waitForTimeout(800);
    await desktopPage.click('.right-nav .menu a[href="/about"]');
    await desktopPage.waitForLoadState("networkidle");
    await desktopPage.waitForTimeout(700);

    const aboutState = await desktopPage.evaluate(() => {
      const toggle = document.querySelector(".nav-mobile-toggle");
      const drawer = document.querySelector(".right-nav");
      const rect = toggle ? toggle.getBoundingClientRect() : null;
      return {
        pathname: window.location.pathname,
        drawerVisibility: drawer ? getComputedStyle(drawer).visibility : null,
        toggleVisible: rect ? rect.width > 0 && rect.height > 0 : false,
      };
    });
    assert(
      aboutState.pathname === "/about" &&
        aboutState.drawerVisibility === "hidden" &&
        aboutState.toggleVisible,
      `About route navigation from drawer failed: ${JSON.stringify(aboutState)}`,
    );

    // Navigate to /contact via burger drawer and verify black burger icon contrast
    await desktopPage.click(".nav-mobile-toggle");
    await desktopPage.waitForTimeout(800);
    await desktopPage.click('.right-nav .menu a[href="/contact"]');
    await desktopPage.waitForLoadState("networkidle");
    await desktopPage.waitForTimeout(700);

    const contactState = await desktopPage.evaluate(() => {
      const toggle = document.querySelector(".nav-mobile-toggle");
      const paths = toggle
        ? [...toggle.querySelectorAll("svg path")].map((p) => ({
            stroke: p.getAttribute("stroke"),
            fill: p.getAttribute("fill"),
          }))
        : [];
      const rect = toggle ? toggle.getBoundingClientRect() : null;
      return {
        pathname: window.location.pathname,
        toggleVisible: rect ? rect.width > 0 && rect.height > 0 : false,
        paths,
      };
    });
    assert(
      contactState.pathname === "/contact" &&
        contactState.toggleVisible &&
        contactState.paths[0]?.stroke === "black" &&
        contactState.paths[1]?.fill === "black",
      `Contact route burger icon must be visible and black: ${JSON.stringify(contactState)}`,
    );

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

    await mobilePage.goto(targetUrl, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(500);

    const mobileInitial = await mobilePage.evaluate(() => {
      const nav = document.querySelector(".navigation");
      const toggle = document.querySelector(".nav-mobile-toggle");
      const desktopNav = document.querySelector(".nav-desktop");
      const rect = toggle ? toggle.getBoundingClientRect() : null;
      return {
        navBg: nav ? getComputedStyle(nav).backgroundColor : null,
        toggleDisplay: toggle ? getComputedStyle(toggle).display : null,
        toggleVisible: rect ? rect.width > 0 && rect.height > 0 : false,
        desktopNavExists: Boolean(desktopNav),
      };
    });
    assert(
      mobileInitial.navBg === "rgba(0, 0, 0, 0)" &&
        mobileInitial.toggleDisplay !== "none" &&
        mobileInitial.toggleVisible &&
        !mobileInitial.desktopNavExists,
      `Mobile initial nav state invalid: ${JSON.stringify(mobileInitial)}`,
    );

    const mobileOverflowClosed = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert(
      mobileOverflowClosed.scrollWidth <= mobileOverflowClosed.innerWidth,
      `Mobile closed drawer caused horizontal overflow: ${JSON.stringify(mobileOverflowClosed)}`,
    );

    await mobilePage.click(".nav-mobile-toggle");
    await mobilePage.waitForTimeout(220);
    const mobileMidOpen = await mobilePage.evaluate(() => {
      const drawer = document.querySelector(".right-nav");
      const transform = drawer ? getComputedStyle(drawer).transform : "none";
      const tx =
        transform && transform !== "none"
          ? new DOMMatrixReadOnly(transform).m41
          : 0;
      return {
        visibility: drawer ? getComputedStyle(drawer).visibility : null,
        tx,
        innerWidth: window.innerWidth,
      };
    });
    assert(
      mobileMidOpen.visibility === "visible" &&
        mobileMidOpen.tx > 5 &&
        mobileMidOpen.tx < mobileMidOpen.innerWidth,
      `Mobile drawer should animate smoothly on open: ${JSON.stringify(mobileMidOpen)}`,
    );
    await mobilePage.waitForTimeout(700);
    const mobileOpen = await mobilePage.evaluate(() => {
      const drawer = document.querySelector(".right-nav");
      return {
        visibility: drawer ? getComputedStyle(drawer).visibility : null,
        width: drawer ? drawer.getBoundingClientRect().width : 0,
      };
    });
    assert(
      mobileOpen.visibility === "visible" && mobileOpen.width > 0,
      `Mobile drawer must open cleanly, got ${JSON.stringify(mobileOpen)}`,
    );

    const mobileOpenPng = path.join(opts.outDir, "burger-menu-mobile-open.png");
    await mobilePage.screenshot({ path: mobileOpenPng });
    console.log(`✓ Saved: ${mobileOpenPng}`);

    // Close mobile drawer and verify scrolled nav background change on mobile
    await mobilePage.click(".nav-mobile-toggle");
    await mobilePage.waitForTimeout(800);
    for (let y = 0; y <= 600; y += 150) {
      await mobilePage.evaluate((top) => window.scrollTo(0, top), y);
      await mobilePage.waitForTimeout(60);
    }
    await mobilePage.waitForTimeout(1200);

    const mobileScrolled = await mobilePage.evaluate(() => {
      const nav = document.querySelector(".navigation");
      const toggle = document.querySelector(".nav-mobile-toggle");
      const rect = toggle ? toggle.getBoundingClientRect() : null;
      return {
        navPosition: nav ? getComputedStyle(nav).position : null,
        navBg: nav ? getComputedStyle(nav).backgroundColor : null,
        navShadow: nav ? getComputedStyle(nav).boxShadow : null,
        hasScrolledDone: Boolean(
          nav?.classList.contains("scrolled") &&
          nav?.classList.contains("done"),
        ),
        toggleTop: rect ? rect.top : -1,
        toggleVisible: rect ? rect.width > 0 && rect.height > 0 : false,
      };
    });
    assert(
      mobileScrolled.navPosition === "fixed" &&
        mobileScrolled.hasScrolledDone &&
        mobileScrolled.navBg === "rgb(231, 231, 231)" &&
        mobileScrolled.navShadow !== "none" &&
        mobileScrolled.toggleVisible &&
        mobileScrolled.toggleTop >= 0,
      `Mobile scrolled header must change background to #e7e7e7, got ${JSON.stringify(mobileScrolled)}`,
    );

    const mobileScrolledPng = path.join(
      opts.outDir,
      "burger-menu-mobile-scrolled.png",
    );
    await mobilePage.screenshot({ path: mobileScrolledPng });
    console.log(`✓ Saved: ${mobileScrolledPng}`);

    await mobilePage.evaluate(() => window.scrollTo(0, 0));
    await mobilePage.waitForTimeout(800);
    const mobileResetBg = await mobilePage.evaluate(() => {
      const nav = document.querySelector(".navigation");
      return nav ? getComputedStyle(nav).backgroundColor : null;
    });
    assert(
      mobileResetBg === "rgba(0, 0, 0, 0)",
      `Mobile nav background must reset to transparent at top, got ${mobileResetBg}`,
    );

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

    console.log("\n✅ Desktop burger menu visual verification passed.");
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
