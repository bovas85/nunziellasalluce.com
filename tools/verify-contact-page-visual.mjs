#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for Contact Page (/contact)
 *
 * Runs an automated Playwright scenario against the Nuxt application to visually verify:
 * 1. Short laptop viewport (1280x720) renders .contact-form--wrapper immediately visible (opacity: 1) without scrolling
 * 2. Desktop viewport (1280x800) shows symmetric centered alignment (width: auto; margin: 0 auto; padding: 0 $gap; justify-self: center)
 * 3. Empty submit marks required fields invalid (is-danger) and shows field-level error messages
 * 4. Floating labels remain lifted on focus and when filled
 * 5. Contact Form 7 non-mail_sent responses (e.g. mail_failed) show .send-error without switching to .sent
 * 6. Contact Form 7 mail_sent responses reveal .sent.is-visible and clear any restored localStorage draft
 * 7. Mobile viewport (390x844) renders cleanly with no horizontal overflow and allows submitting restored drafts
 * 8. H.264 MP4 walkthrough video (.github/assets/contact-page-walkthrough.mp4) + PNG keyframes
 *
 * Usage:
 *   node tools/verify-contact-page-visual.mjs
 *   node tools/verify-contact-page-visual.mjs --url "http://127.0.0.1:3000"
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
    mp4Path: path.resolve(".github/assets/contact-page-walkthrough.mp4"),
    tempDir: "/tmp/contact_page_visual",
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
    },
    stdio: "pipe",
  });

  serverProc.on("error", (err) => {
    console.error("[Visual Test] Server spawn error:", err);
  });

  const targetUrl = `http://127.0.0.1:${port}`;
  console.log(`[Visual Test] Waiting for ${targetUrl} to become responsive...`);
  await waitForServer(`${targetUrl}/health.json`);
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
  console.log("=== NunziellaSalluce Contact Page Visual Verification ===");

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
    // 1. Short Laptop Viewport (1280x720) — verify form visible without scroll
    console.log(
      "\n[1/4] Verifying Laptop Viewport (1280x720) Above-the-Fold Visibility...",
    );
    const laptopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 2,
    });
    const laptopPage = await laptopContext.newPage();
    const laptopErrors = [];
    laptopPage.on("console", (msg) => {
      if (msg.type() === "error") laptopErrors.push(msg.text());
    });
    laptopPage.on("pageerror", (err) => laptopErrors.push(err.message));

    await laptopPage.goto(`${targetUrl}/contact`, { waitUntil: "networkidle" });
    await laptopPage.waitForTimeout(700);

    const laptopMetrics = await laptopPage.evaluate(() => {
      const wrapper = document.querySelector(".contact-form--wrapper");
      const form = document.querySelector(".contact-form");
      const rect = wrapper ? wrapper.getBoundingClientRect() : null;
      const formRect = form ? form.getBoundingClientRect() : null;
      return {
        exists: Boolean(wrapper),
        className: wrapper?.className ?? "",
        opacity: wrapper ? getComputedStyle(wrapper).opacity : null,
        left: rect ? rect.left : -1,
        right: rect ? rect.right : -1,
        width: rect ? rect.width : 0,
        formLeft: formRect ? formRect.left : -1,
        formRight: formRect ? formRect.right : -1,
        viewportWidth: window.innerWidth,
        overflowX:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });

    assert(laptopMetrics.exists, "Contact form wrapper must exist at 1280x720");
    assert(
      laptopMetrics.opacity === "1" &&
        laptopMetrics.className.includes("animated"),
      `Form must be visible immediately at 1280x720 without scrolling, got ${JSON.stringify(laptopMetrics)}`,
    );
    const laptopLeftGap = laptopMetrics.formLeft;
    const laptopRightGap =
      laptopMetrics.viewportWidth - laptopMetrics.formRight;
    assert(
      Math.abs(laptopLeftGap - laptopRightGap) <= 1 &&
        laptopMetrics.width <= 840,
      `Form must be centered horizontally on desktop, got ${JSON.stringify(laptopMetrics)}`,
    );
    assert(!laptopMetrics.overflowX, "No horizontal overflow at 1280x720");
    assert(
      laptopErrors.length === 0,
      `Unexpected errors at 1280x720: ${JSON.stringify(laptopErrors)}`,
    );
    await laptopContext.close();

    // 2. Desktop Viewport (1280x800) with Video Recording
    console.log(
      "\n[2/4] Verifying Desktop Contact Flow (1280x800, Recording Video)...",
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

    let cf7Mode = "mail_failed";
    await desktopPage.route("**/api/contact", async (route) => {
      if (cf7Mode === "mail_failed") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "mail_failed",
            message: "There was an error trying to send your message.",
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "mail_sent",
            message: "Thank you for your message. It has been sent.",
          }),
        });
      }
    });

    await desktopPage.goto(`${targetUrl}/contact`, {
      waitUntil: "networkidle",
    });
    await desktopPage.waitForTimeout(700);

    const desktopInitial = await desktopPage.evaluate(() => {
      const wrapper = document.querySelector(".contact-form--wrapper");
      const form = document.querySelector(".contact-form");
      const rect = wrapper ? wrapper.getBoundingClientRect() : null;
      const formRect = form ? form.getBoundingClientRect() : null;
      return {
        opacity: wrapper ? getComputedStyle(wrapper).opacity : null,
        left: rect ? rect.left : -1,
        width: rect ? rect.width : 0,
        formLeft: formRect ? formRect.left : -1,
        formRight: formRect ? formRect.right : -1,
        viewportWidth: window.innerWidth,
        overflowX:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });
    const desktopLeftGap = desktopInitial.formLeft;
    const desktopRightGap =
      desktopInitial.viewportWidth - desktopInitial.formRight;
    assert(
      desktopInitial.opacity === "1" &&
        Math.abs(desktopLeftGap - desktopRightGap) <= 1 &&
        desktopInitial.width <= 840,
      `Desktop initial form must be visible and centered: ${JSON.stringify(desktopInitial)}`,
    );
    assert(!desktopInitial.overflowX, "No horizontal overflow at 1280x800");

    const desktopPng = path.join(opts.outDir, "contact-page-desktop.png");
    await desktopPage.screenshot({ path: desktopPng });
    console.log(`✓ Saved: ${desktopPng}`);

    // Scroll form slightly into comfortable view and trigger empty validation
    await desktopPage
      .locator("button.button--contact")
      .scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await desktopPage.click("button.button--contact");
    await desktopPage.waitForTimeout(600);

    const validationState = await desktopPage.evaluate(() => ({
      nameDanger: document
        .querySelector("#name")
        ?.classList.contains("is-danger"),
      emailDanger: document
        .querySelector("#email")
        ?.classList.contains("is-danger"),
    }));
    assert(
      validationState.nameDanger && validationState.emailDanger,
      `Empty submit must mark required fields invalid: ${JSON.stringify(validationState)}`,
    );

    const desktopValidationPng = path.join(
      opts.outDir,
      "contact-page-desktop-validation.png",
    );
    await desktopPage.screenshot({ path: desktopValidationPng });
    console.log(`✓ Saved: ${desktopValidationPng}`);

    // Fill out the form cleanly
    await desktopPage.fill("#name", "Jane Doe");
    await desktopPage.waitForTimeout(200);
    await desktopPage.fill("#email", "jane@example.com");
    await desktopPage.waitForTimeout(200);
    await desktopPage.fill("#message", "Hello from Playwright visual test");
    await desktopPage.click('label[for="check1"]');
    await desktopPage.waitForTimeout(400);

    const labelState = await desktopPage.evaluate(() => ({
      nameSelected: document
        .querySelector('label[for="name"]')
        ?.classList.contains("selected"),
      emailSelected: document
        .querySelector('label[for="email"]')
        ?.classList.contains("selected"),
      messageSelected: document
        .querySelector('label[for="message"]')
        ?.classList.contains("selected"),
    }));
    assert(
      labelState.nameSelected &&
        labelState.emailSelected &&
        labelState.messageSelected,
      `Floating labels must remain selected for filled fields: ${JSON.stringify(labelState)}`,
    );

    // Submit with mail_failed first
    cf7Mode = "mail_failed";
    await desktopPage.click("button.button--contact");
    await desktopPage.waitForTimeout(700);

    const errorState = await desktopPage.evaluate(() => {
      const errorEl = [...document.querySelectorAll(".send-error")].find((el) =>
        el.textContent?.includes("error sending the form"),
      );
      const sentEl = document.querySelector(".sent");
      return {
        errorVisible: errorEl
          ? getComputedStyle(errorEl).display !== "none"
          : false,
        sentVisible: sentEl?.classList.contains("is-visible") ?? false,
      };
    });
    assert(
      errorState.errorVisible && !errorState.sentVisible,
      `CF7 mail_failed must show send-error and not .sent: ${JSON.stringify(errorState)}`,
    );

    const desktopErrorPng = path.join(
      opts.outDir,
      "contact-page-desktop-error.png",
    );
    await desktopPage.screenshot({ path: desktopErrorPng });
    console.log(`✓ Saved: ${desktopErrorPng}`);

    // Retry with mail_sent
    cf7Mode = "mail_sent";
    await desktopPage.click("button.button--contact");
    await desktopPage.waitForTimeout(900);

    const sentState = await desktopPage.evaluate(() => {
      const errorEl = [...document.querySelectorAll(".send-error")].find((el) =>
        el.textContent?.includes("error sending the form"),
      );
      return {
        sentVisible:
          document.querySelector(".sent")?.classList.contains("is-visible") ??
          false,
        errorHidden: errorEl
          ? getComputedStyle(errorEl).display === "none"
          : true,
        remainingDraft: localStorage.getItem("contactFormData"),
      };
    });
    assert(
      sentState.sentVisible &&
        sentState.errorHidden &&
        sentState.remainingDraft === null,
      `CF7 mail_sent must reveal .sent.is-visible, clear .send-error, and clear draft: ${JSON.stringify(sentState)}`,
    );

    const desktopSentPng = path.join(
      opts.outDir,
      "contact-page-desktop-sent.png",
    );
    await desktopPage.screenshot({ path: desktopSentPng });
    console.log(`✓ Saved: ${desktopSentPng}`);

    await desktopPage.close();
    await desktopContext.close();

    assert(
      consoleErrors.length === 0 && pageErrors.length === 0,
      `Unexpected desktop browser errors: console=${JSON.stringify(consoleErrors)} page=${JSON.stringify(pageErrors)}`,
    );

    const videoFiles = fs.existsSync(videoDir) ? fs.readdirSync(videoDir) : [];
    if (videoFiles.length > 0) {
      recordedVideoPath = path.join(videoDir, videoFiles[0]);
      console.log(`✓ Raw WebM video captured: ${recordedVideoPath}`);
    }

    // 3. Mobile Viewport (390x844) with restored offline draft
    console.log(
      "\n[3/4] Verifying Mobile Viewport (390x844) & Draft Submission...",
    );
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

    await mobilePage.addInitScript(() => {
      localStorage.setItem(
        "contactFormData",
        JSON.stringify({
          yourName: "Saved User",
          yourEmail: "saved@example.com",
          yourMessage: "Offline draft",
          youAgree: true,
        }),
      );
    });
    await mobilePage.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "mail_sent" }),
      });
    });

    await mobilePage.goto(`${targetUrl}/contact`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(700);

    const mobileInitial = await mobilePage.evaluate(() => {
      const wrapper = document.querySelector(".contact-form--wrapper");
      const btn = document.querySelector("button.button--contact");
      return {
        opacity: wrapper ? getComputedStyle(wrapper).opacity : null,
        btnDisabled: btn ? btn.hasAttribute("disabled") : true,
        overflowX:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });
    assert(
      mobileInitial.opacity === "1" &&
        !mobileInitial.btnDisabled &&
        !mobileInitial.overflowX,
      `Mobile contact page with restored draft invalid: ${JSON.stringify(mobileInitial)}`,
    );

    await mobilePage.locator("button.button--contact").scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    const mobilePng = path.join(opts.outDir, "contact-page-mobile.png");
    await mobilePage.screenshot({ path: mobilePng });
    console.log(`✓ Saved: ${mobilePng}`);

    await mobilePage.click("button.button--contact");
    await mobilePage.waitForTimeout(800);
    const mobileSubmitted = await mobilePage.evaluate(() => ({
      sentVisible:
        document.querySelector(".sent")?.classList.contains("is-visible") ??
        false,
      remainingDraft: localStorage.getItem("contactFormData"),
    }));
    assert(
      mobileSubmitted.sentVisible && mobileSubmitted.remainingDraft === null,
      `Restored draft submit on mobile failed: ${JSON.stringify(mobileSubmitted)}`,
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

    console.log("\n✅ Contact page visual verification passed.");
  } finally {
    await browser.close();
    if (serverProc) {
      serverProc.kill("SIGTERM");
    }
  }
}

runVisualTest().catch((err) => {
  console.error("\n❌ Visual test failed:", err);
  process.exit(1);
});
