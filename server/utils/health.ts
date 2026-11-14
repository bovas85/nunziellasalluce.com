import { execSync } from "node:child_process";

export interface HealthReport {
  ok: boolean;
  status: "healthy" | "unhealthy";
  commitSha: string;
  commit: {
    sha: string;
    message: string;
    committedAt: string;
    url: string;
  };
  deploy: {
    environment: string;
    deployedAt: string;
    runUrl?: string;
  };
}

export function getHealthReport(): HealthReport {
  const envSha =
    process.env.COMMIT_REF ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA;

  let sha = envSha || "";
  let message = "Build deployment";
  let committedAt = new Date().toISOString();

  if (!sha) {
    try {
      sha = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      message = execSync("git log -1 --pretty=%s", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      committedAt = execSync("git log -1 --pretty=%cI", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      sha = "unknown";
    }
  }

  const environment =
    process.env.CONTEXT ||
    process.env.NODE_ENV ||
    (process.env.NETLIFY ? "netlify" : "production");

  const githubRepo = "bovas85/nunziellasalluce.com";
  const commitUrl =
    sha && sha !== "unknown"
      ? `https://github.com/${githubRepo}/commit/${sha}`
      : `https://github.com/${githubRepo}`;

  return {
    ok: true,
    status: "healthy",
    commitSha: sha,
    commit: {
      sha,
      message,
      committedAt,
      url: commitUrl,
    },
    deploy: {
      environment,
      deployedAt: new Date().toISOString(),
      runUrl:
        process.env.DEPLOY_URL ||
        process.env.URL ||
        "https://nunziellasalluce.com",
    },
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderHealthHtml(report: HealthReport): string {
  const commitLink =
    report.commit.sha !== "unknown"
      ? `<a href="${escapeHtml(report.commit.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(report.commit.sha)}</a>`
      : "unknown";

  const rawJson = escapeHtml(JSON.stringify(report, null, 2));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nunziella Salluce · Health</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #09090b;
      --card-bg: #18181b;
      --border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --primary: #22c55e;
      --primary-bg: rgba(34, 197, 94, 0.12);
      --link: #38bdf8;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --card-bg: #ffffff;
        --border: #e2e8f0;
        --text: #0f172a;
        --text-muted: #64748b;
        --primary: #16a34a;
        --primary-bg: rgba(22, 163, 74, 0.1);
        --link: #0284c7;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.25rem;
    }
    main {
      width: 100%;
      max-width: 44rem;
    }
    .brand {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      background: var(--primary-bg);
      color: var(--primary);
    }
    .badge::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    dl {
      display: grid;
      grid-template-columns: 8.5rem 1fr;
      gap: 0.85rem 1.25rem;
      font-size: 0.9375rem;
    }
    dt {
      color: var(--text-muted);
      font-weight: 500;
    }
    dd {
      overflow-wrap: anywhere;
    }
    dd pre {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      white-space: pre-wrap;
    }
    a {
      color: var(--link);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .footer-actions {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }
    details {
      margin-top: 1.25rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
    }
    summary {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--text-muted);
      cursor: pointer;
      font-weight: 500;
    }
    details pre {
      padding: 0 1rem 1rem;
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      overflow-x: auto;
      color: var(--text);
    }
    @media (max-width: 600px) {
      dl { grid-template-columns: 1fr; gap: 0.25rem; }
      dt { margin-top: 0.5rem; }
      dt:first-child { margin-top: 0; }
    }
  </style>
</head>
<body>
  <main>
    <div class="brand">Nunziella Salluce · Production Status</div>
    <div class="panel">
      <div class="header">
        <h1>Health Check</h1>
        <div class="badge">Healthy</div>
      </div>
      <dl>
        <dt>Commit SHA</dt>
        <dd><code>${commitLink}</code></dd>
        <dt>Commit Message</dt>
        <dd><pre>${escapeHtml(report.commit.message)}</pre></dd>
        <dt>Committed At</dt>
        <dd>${escapeHtml(report.commit.committedAt)}</dd>
        <dt>Deployed At</dt>
        <dd>${escapeHtml(report.deploy.deployedAt)}</dd>
        <dt>Environment</dt>
        <dd>${escapeHtml(report.deploy.environment)}</dd>
      </dl>
      <div class="footer-actions">
        <a href="/health.json">View JSON Payload</a>
        <a href="https://github.com/bovas85/nunziellasalluce.com" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
      </div>
      <details>
        <summary>Raw JSON</summary>
        <pre>${rawJson}</pre>
      </details>
    </div>
  </main>
</body>
</html>`;
}
