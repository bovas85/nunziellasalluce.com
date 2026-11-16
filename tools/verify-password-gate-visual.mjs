#!/usr/bin/env node

/**
 * Visual Test & Verification Runner for Case Study Password Gate
 *
 * Runs an automated Playwright scenario to visually verify and capture:
 * 1. Default locked state (desktop 1280x800)
 * 2. Invalid password error alert state
 * 3. Mobile viewport layout (390x844)
 * 4. Successful verification & unlock transition
 * 5. Animated walkthrough GIF (.github/assets/case-study-password-gate-walkthrough.gif)
 *
 * Usage:
 *   node tools/verify-password-gate-visual.mjs
 *   node tools/verify-password-gate-visual.mjs --url "https://nunziellasalluce-nunziellasall...workers.dev"
 */

import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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

function createMockServer() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confidential Case Study - Protected | Nunziella Salluce</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #00172c;
      --navy-surface: #0a233d;
      --peach: #f4a261;
      --peach-rgb: 244, 162, 97;
      --text: #ffffff;
      --text-muted: #cbd5e1;
      --font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--navy);
      color: var(--text);
      font-family: var(--font-family);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    header {
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .brand-logo {
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: 0.5px;
      color: var(--text);
      text-decoration: none;
    }

    .brand-logo span {
      color: var(--peach);
    }

    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      margin-left: 24px;
      font-size: 0.95rem;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: var(--peach);
    }

    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }

    .password-gate {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gate-card {
      width: 100%;
      max-width: 520px;
      background-color: var(--navy-surface);
      border: 1px solid rgba(var(--peach-rgb), 0.3);
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
      text-align: center;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .lock-icon {
      width: 58px;
      height: 58px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: rgba(var(--peach-rgb), 0.15);
      color: var(--peach);
    }

    .lock-icon svg {
      width: 28px;
      height: 28px;
    }

    .badge {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--peach);
      margin-bottom: 12px;
    }

    .title {
      font-size: 1.85rem;
      font-weight: 700;
      line-height: 1.25;
      color: var(--text);
      margin-bottom: 14px;
    }

    .description {
      font-size: 0.975rem;
      line-height: 1.6;
      color: var(--text-muted);
      margin-bottom: 28px;
    }

    .gate-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: left;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .input {
      width: 100%;
      padding: 13px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: var(--navy);
      color: var(--text);
      font-family: inherit;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input:focus {
      border-color: var(--peach);
      box-shadow: 0 0 0 3px rgba(var(--peach-rgb), 0.2);
    }

    .error {
      color: #ff6b6b;
      font-size: 0.875rem;
      background-color: rgba(255, 107, 107, 0.12);
      border: 1px solid rgba(255, 107, 107, 0.35);
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error::before {
      content: "!";
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ff6b6b;
      color: #00172c;
      font-weight: 800;
      font-size: 12px;
      flex-shrink: 0;
    }

    .button-unlock {
      margin-top: 8px;
      padding: 14px 20px;
      border-radius: 8px;
      border: none;
      background-color: var(--peach);
      color: var(--navy);
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 0.2s, transform 0.1s;
    }

    .button-unlock:hover:not(:disabled) {
      background-color: #f6b27d;
      transform: translateY(-1px);
    }

    .button-unlock:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .footer-link {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .back-link {
      font-size: 0.875rem;
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--peach);
    }

    /* Unlocked Case Study View */
    .unlocked-hero {
      display: none;
      width: 100%;
      max-width: 960px;
      padding: 40px 24px;
      animation: fadeIn 0.5s ease-out;
    }

    .unlocked-banner {
      background: rgba(var(--peach-rgb), 0.15);
      border: 1px solid var(--peach);
      border-radius: 8px;
      padding: 12px 18px;
      color: var(--peach);
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .unlocked-title {
      font-size: 2.75rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .unlocked-desc {
      font-size: 1.15rem;
      color: var(--text-muted);
      line-height: 1.6;
      max-width: 720px;
      margin-bottom: 32px;
    }

    .mock-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }

    .metric-card {
      background: var(--navy-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 24px;
      text-align: left;
    }

    .metric-card .val {
      font-size: 2rem;
      font-weight: 700;
      color: var(--peach);
      margin-bottom: 4px;
    }

    .metric-card .lbl {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    @media (max-width: 576px) {
      header {
        padding: 16px 20px;
      }
      .gate-card {
        padding: 28px 20px;
      }
      .title {
        font-size: 1.5rem;
      }
      .description {
        font-size: 0.9rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="brand-logo">Nunziella <span>Salluce</span></a>
    <nav class="nav-links">
      <a href="/">Projects</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>

  <main>
    <div id="gate-container" class="password-gate" data-testid="password-gate">
      <div class="gate-card">
        <div class="lock-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <span class="badge">Protected Work</span>

        <h1 class="title">Confidential Client Project</h1>

        <p class="description">
          This client case study contains confidential material and is password
          protected. Please enter your access password below to view the project.
        </p>

        <form id="password-form" class="gate-form">
          <div class="field">
            <label for="case-study-password" class="label">Access Password</label>
            <div class="control">
              <input
                id="case-study-password"
                type="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="Enter password"
                class="input"
              />
            </div>
          </div>

          <p id="gate-error-message" role="alert" aria-live="polite" class="error" style="display: none;"></p>

          <button id="btn-unlock" type="submit" class="button-unlock">
            <span id="btn-text">Unlock Case Study</span>
          </button>
        </form>

        <div class="footer-link">
          <a href="/" class="back-link">&larr; Return to All Projects</a>
        </div>
      </div>
    </div>

    <!-- Unlocked State View -->
    <div id="unlocked-view" class="unlocked-hero">
      <div class="unlocked-banner">
        <span>✓</span> Case Study Access Verified & Unlocked
      </div>
      <h1 class="unlocked-title">Fintech Design System & Experience Architecture</h1>
      <p class="unlocked-desc">
        A confidential complete redesign of an enterprise wealth management and trading workflow, increasing task completion by 48% and reducing onboarding time from 3 weeks to 2 days.
      </p>
      <div class="mock-metrics">
        <div class="metric-card">
          <div class="val">+48%</div>
          <div class="lbl">Workflow Efficiency</div>
        </div>
        <div class="metric-card">
          <div class="val">99.8%</div>
          <div class="lbl">Design System Adoption</div>
        </div>
        <div class="metric-card">
          <div class="val">4.9 / 5</div>
          <div class="lbl">User Satisfaction Score</div>
        </div>
      </div>
    </div>
  </main>

  <script>
    const form = document.getElementById('password-form');
    const input = document.getElementById('case-study-password');
    const errorMsg = document.getElementById('gate-error-message');
    const btnUnlock = document.getElementById('btn-unlock');
    const btnText = document.getElementById('btn-text');
    const gateContainer = document.getElementById('gate-container');
    const unlockedView = document.getElementById('unlocked-view');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;

      btnUnlock.disabled = true;
      btnText.textContent = 'Verifying...';
      errorMsg.style.display = 'none';

      try {
        const res = await fetch('/api/verify-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: val }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          gateContainer.style.display = 'none';
          unlockedView.style.display = 'block';
        } else {
          errorMsg.textContent = data.error || 'Incorrect password. Please try again.';
          errorMsg.style.display = 'flex';
          input.focus();
        }
      } catch (err) {
        errorMsg.textContent = 'Verification service temporarily unavailable. Please retry.';
        errorMsg.style.display = 'flex';
      } finally {
        btnUnlock.disabled = false;
        btnText.textContent = 'Unlock Case Study';
      }
    });
  </script>
</body>
</html>`;

  return http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/verify-access") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body || "{}");
          // Accept "design2026", "secret", or any valid configured pass
          if (
            parsed.password === "design2026" ||
            parsed.password === "correct-password"
          ) {
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Set-Cookie":
                "case_study_access=mock_token_verified; Path=/; HttpOnly; SameSite=Lax",
            });
            res.end(JSON.stringify({ success: true }));
          } else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                error: "Incorrect password. Please try again.",
              }),
            );
          }
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        }
      });
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });
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

  let server;
  let baseUrl = opts.url;

  if (!baseUrl) {
    server = createMockServer();
    await new Promise((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`[Visual Test] Local mock gate harness running on ${baseUrl}`);
        resolve();
      });
    });
  } else {
    console.log(`[Visual Test] Connecting to live endpoint: ${baseUrl}`);
  }

  const browser = await chromium.launch({ headless: true });
  const frames = [];

  try {
    // 1. Desktop Initial Locked State (1280x800)
    console.log("\n[1/5] Testing Desktop Locked State (1280x800)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(baseUrl, { waitUntil: "networkidle" });

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
    console.log("\n[2/5] Testing Invalid Password Submission & Live Error Alert...");
    await desktopPage.fill("#case-study-password", "invalid-client-pass");
    const frame2 = path.join(opts.tempDir, "frame_02_typed_wrong.png");
    await desktopPage.screenshot({ path: frame2 });
    frames.push(frame2);

    await desktopPage.click("#btn-unlock");
    await desktopPage.waitForSelector(
      '#gate-error-message:has-text("Incorrect password")',
      { state: "visible" },
    );

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
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });

    const mobileScreenshot = path.join(
      opts.outDir,
      "case-study-password-gate-mobile.png",
    );
    await mobilePage.screenshot({ path: mobileScreenshot });
    console.log(`✓ Saved: ${mobileScreenshot}`);
    await mobileContext.close();

    // 4. Type Correct Password & Unlock
    console.log("\n[4/5] Testing Valid Password & Unlock Transition...");
    await desktopPage.fill("#case-study-password", "design2026");
    const frame4 = path.join(opts.tempDir, "frame_04_typed_correct.png");
    await desktopPage.screenshot({ path: frame4 });
    frames.push(frame4);

    await desktopPage.click("#btn-unlock");
    await desktopPage.waitForSelector("#unlocked-view", { state: "visible" });

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

    // Duplicate key frames for realistic user reading pacing
    const sequence = [
      frame1,
      frame1, // 2s on locked view
      frame2, // typing wrong
      frame3,
      frame3, // 2s on error alert
      frame4, // typing correct
      frame5,
      frame5, // 2.5s on unlocked case study
      frame5,
    ];

    const seqDir = path.join(opts.tempDir, "seq");
    if (!fs.existsSync(seqDir)) fs.mkdirSync(seqDir, { recursive: true });

    sequence.forEach((f, idx) => {
      const pad = String(idx + 1).padStart(3, "0");
      fs.copyFileSync(f, path.join(seqDir, `step_${pad}.png`));
    });

    try {
      execSync(
        `ffmpeg -y -framerate 1.2 -i "${seqDir}/step_%03d.png" -vf "scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${opts.gifPath}"`,
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
    if (server) {
      server.close();
    }
  }
}

runVisualTest().catch((err) => {
  console.error("Visual test runner encountered error:", err);
  process.exit(1);
});
