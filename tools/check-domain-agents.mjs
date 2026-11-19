#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");

const STOPWORDS = new Set([
  "that",
  "this",
  "with",
  "from",
  "only",
  "when",
  "must",
  "never",
  "should",
  "because",
  "their",
  "them",
  "they",
  "what",
  "which",
  "about",
  "without",
  "directly",
  "inside",
  "other",
  "always",
  "every",
  "using",
  "avoid",
  "where",
  "instead",
  "still",
  "stays",
  "stay",
  "approve",
  "propose",
  "removing",
]);

export function parseFrontmatter(mdText) {
  const lines = mdText.split(/\r?\n/);
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return {
      owns: [],
      model: "gemini-3.8-flash",
      access: "read-only",
      job: mdText,
    };
  }
  const endIdx = lines.slice(1).findIndex((l) => l.trim() === "---");
  if (endIdx === -1) {
    return {
      owns: [],
      model: "gemini-3.8-flash",
      access: "read-only",
      job: mdText,
    };
  }
  const meta = {
    owns: [],
    model: "gemini-3.8-flash",
    access: "read-only",
    job: "",
  };
  let inOwns = false;
  for (const raw of lines.slice(1, endIdx + 1)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("owns:")) {
      inOwns = true;
      continue;
    }
    if (inOwns && line.startsWith("- ")) {
      meta.owns.push(
        line
          .slice(2)
          .trim()
          .replace(/^['"]|['"]$/g, ""),
      );
      continue;
    }
    inOwns = false;
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const k = line.slice(0, colonIdx).trim();
      const v = line
        .slice(colonIdx + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      meta[k] = v;
    }
  }
  meta.job = lines
    .slice(endIdx + 2)
    .join("\n")
    .trim();
  return meta;
}

export function discoverDomainAgents(repoRoot = DEFAULT_ROOT) {
  const agentsDir = path.join(repoRoot, "agents");
  if (!fs.existsSync(agentsDir)) return [];
  const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(agentsDir, entry.name);
    const agentMd = path.join(dir, "agent.md");
    if (!fs.existsSync(agentMd)) continue;
    const meta = parseFrontmatter(fs.readFileSync(agentMd, "utf8"));
    if (meta.owns.length === 0) continue;
    result.push({
      name: entry.name,
      dir,
      agentMd,
      glossaryMd: path.join(dir, "glossary.md"),
      memoriesMd: path.join(dir, "memories.md"),
      scenariosMd: path.join(dir, "scenarios.md"),
      ...meta,
    });
  }
  return result;
}

export function globMatches(pattern, relPath) {
  const normPattern = pattern.replace(/^\.\//, "");
  const normPath = relPath.replace(/^\.\//, "");
  if (normPattern.endsWith("/**")) {
    const prefix = normPattern.slice(0, -3).replace(/\/$/, "");
    return normPath === prefix || normPath.startsWith(`${prefix}/`);
  }
  const escaped = normPattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]");
  return new RegExp(`^${escaped}$`).test(normPath);
}

export function matchFiles(repoRoot, files) {
  const agents = discoverDomainAgents(repoRoot);
  const matches = [];
  for (const agent of agents) {
    const hitFiles = [];
    for (const f of files) {
      const rel = path.isAbsolute(f) ? path.relative(repoRoot, f) : f;
      const posix = rel.split(path.sep).join("/");
      if (agent.owns.some((g) => globMatches(g, posix))) {
        hitFiles.push(posix);
      }
    }
    if (hitFiles.length > 0) {
      matches.push({
        agent: agent.name,
        model: agent.model,
        access: agent.access,
        matchedFiles: [...new Set(hitFiles)].sort(),
      });
    }
  }
  return matches;
}

export function parseScenarios(scenariosPath) {
  if (!fs.existsSync(scenariosPath)) return [];
  const scenarios = [];
  let current = null;
  let activeField = null;
  for (const raw of fs.readFileSync(scenariosPath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      if (current) scenarios.push(current);
      current = { title: line.slice(3).trim(), ask: "", expect: "", never: "" };
      activeField = null;
    } else if (current) {
      let matchedPrefix = false;
      for (const prefix of ["Ask:", "Expect:", "Never:"]) {
        if (line.startsWith(prefix)) {
          activeField = prefix.slice(0, -1).toLowerCase();
          current[activeField] = line.slice(prefix.length).trim();
          matchedPrefix = true;
          break;
        }
      }
      if (!matchedPrefix && activeField && line && !line.startsWith("#")) {
        current[activeField] = `${current[activeField]} ${line}`.trim();
      }
    }
  }
  if (current) scenarios.push(current);
  return scenarios.filter((s) => s.ask && s.expect);
}

function extractTokens(text) {
  const backticked = [...text.matchAll(/`([^`]+)`/g)].map((m) =>
    m[1].toLowerCase(),
  );
  const plain = text.replace(/`[^`]+`/g, " ");
  const words = (plain.match(/[A-Za-z0-9_./-]{4,}/g) ?? []).map((w) =>
    w.toLowerCase().replace(/[.,;:]+$/, ""),
  );
  const all = [...backticked, ...words.filter((w) => !STOPWORDS.has(w))];
  return [...new Set(all)];
}

export function evaluateScenarioDeterministic(agent, scenario) {
  const parts = [];
  if (fs.existsSync(agent.glossaryMd)) {
    parts.push(fs.readFileSync(agent.glossaryMd, "utf8"));
  }
  if (fs.existsSync(agent.memoriesMd)) {
    parts.push(fs.readFileSync(agent.memoriesMd, "utf8"));
  }
  const corpus = parts.join("\n").toLowerCase();
  if (!corpus.trim()) {
    return {
      title: scenario.title,
      passed: false,
      reason: "Missing glossary.md and memories.md content",
    };
  }
  const exact = [...scenario.expect.matchAll(/`([^`]+)`/g)]
    .map((m) => m[1].toLowerCase())
    .filter((t) => t.length >= 3);
  const missingExact = exact.filter((t) => !corpus.includes(t));
  const tokens = extractTokens(scenario.expect);
  const matched = tokens.filter((t) => corpus.includes(t));
  const coverage = tokens.length > 0 ? matched.length / tokens.length : 0;
  const passed = missingExact.length === 0 && coverage >= 0.55;
  return {
    title: scenario.title,
    passed,
    coverage: Number(coverage.toFixed(3)),
    reason: passed
      ? `Matched ${matched.length}/${tokens.length} invariant tokens`
      : `Missing exact ${JSON.stringify(missingExact)} or low coverage (${Math.round(coverage * 100)}%)`,
  };
}

export function evaluateScenarioGemini(agent, scenario, execFn = execFileSync) {
  const glossary = fs.existsSync(agent.glossaryMd)
    ? fs.readFileSync(agent.glossaryMd, "utf8")
    : "";
  const memories = fs.existsSync(agent.memoriesMd)
    ? fs.readFileSync(agent.memoriesMd, "utf8")
    : "";
  const askPrompt = `${agent.job}\n\n### Glossary\n${glossary}\n\n### Memories\n${memories}\n\nQuestion:\n${scenario.ask}\n\nAnswer concisely using only the glossary and memories above.`;
  const rawAnswer = execFn(
    "gemini",
    [
      "-p",
      askPrompt,
      "-m",
      agent.model,
      "--approval-mode",
      "plan",
      "-o",
      "json",
    ],
    { encoding: "utf8", timeout: 60000 },
  );
  const answerText = JSON.parse(rawAnswer).response ?? rawAnswer;
  const judgePrompt = `Compare Agent Answer against Expect and Never.\nExpect: ${scenario.expect}\nNever: ${scenario.never}\nAgent Answer: ${answerText}\nReturn ONLY JSON: {"passed": true|false, "reason": "short sentence"}`;
  const rawJudge = execFn(
    "gemini",
    [
      "-p",
      judgePrompt,
      "-m",
      agent.model,
      "--approval-mode",
      "plan",
      "-o",
      "json",
    ],
    { encoding: "utf8", timeout: 60000 },
  );
  const jText = JSON.parse(rawJudge).response ?? rawJudge;
  const match = jText.match(/\{[\s\S]*\}/);
  const verdict = match
    ? JSON.parse(match[0])
    : { passed: false, reason: "Unparseable judge response" };
  return {
    title: scenario.title,
    passed: Boolean(verdict.passed),
    reason: verdict.reason ?? "",
  };
}

export function runSelfTest(repoRoot = DEFAULT_ROOT) {
  const hit = matchFiles(repoRoot, ["alchemy.run.ts", "app/pages/index.vue"]);
  const miss = matchFiles(repoRoot, ["app/pages/index.vue"]);
  if (hit.length !== 1 || hit[0].agent !== "hosting") {
    throw new Error(
      `Expected hosting router match, got ${JSON.stringify(hit)}`,
    );
  }
  if (miss.length !== 0) {
    throw new Error(
      `Expected empty match for unrelated path, got ${JSON.stringify(miss)}`,
    );
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "domain-agent-lab-"));
  try {
    const labAgentDir = path.join(tmpDir, "agents", "hosting");
    fs.mkdirSync(labAgentDir, { recursive: true });
    for (const f of [
      "agent.md",
      "glossary.md",
      "memories.md",
      "scenarios.md",
    ]) {
      fs.copyFileSync(
        path.join(repoRoot, "agents", "hosting", f),
        path.join(labAgentDir, f),
      );
    }
    const [labAgent] = discoverDomainAgents(tmpDir);
    const scenarios = parseScenarios(labAgent.scenariosMd);
    const baseline = scenarios.map((s) =>
      evaluateScenarioDeterministic(labAgent, s),
    );
    if (!baseline.every((r) => r.passed)) {
      throw new Error(`Baseline scenarios failed: ${JSON.stringify(baseline)}`);
    }

    const gPath = path.join(labAgentDir, "glossary.md");
    const mPath = path.join(labAgentDir, "memories.md");
    fs.writeFileSync(
      gPath,
      fs
        .readFileSync(gPath, "utf8")
        .replace(
          /Edge Case-Study Auth[\s\S]*?ACF\./,
          "Edge Case-Study Auth: checks passwords.",
        ),
    );
    fs.writeFileSync(
      mPath,
      fs
        .readFileSync(mPath, "utf8")
        .replace(/- \*\*Edge auth stays out of WordPress ACF:[\s\S]*?\)_/g, ""),
    );
    const mutated = scenarios.map((s) =>
      evaluateScenarioDeterministic(labAgent, s),
    );
    if (mutated.every((r) => r.passed)) {
      throw new Error(
        "Weakened glossary/memory was expected to fail scenario check",
      );
    }
    return {
      selfTest: "PASSED",
      routerHit: hit[0].matchedFiles,
      baselineScenarios: baseline.length,
      weakenedFailed: mutated.filter((r) => !r.passed).map((r) => r.title),
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export function main(
  args = process.argv.slice(2),
  repoRoot = DEFAULT_ROOT,
  execFn = execFileSync,
  logFn = console.log,
) {
  const useSelfTest = args.includes("--self-test");
  const useAll = args.includes("--all");
  const modeIdx = args.indexOf("--mode");
  const mode = modeIdx !== -1 ? args[modeIdx + 1] : "deterministic";
  const matchIdx = args.indexOf("--match-files");

  if (matchIdx !== -1) {
    const files = args.slice(matchIdx + 1).filter((a) => !a.startsWith("--"));
    logFn(JSON.stringify({ matches: matchFiles(repoRoot, files) }, null, 2));
    return 0;
  }

  let exitCode = 0;
  if (useAll) {
    const agents = discoverDomainAgents(repoRoot).filter((a) =>
      fs.existsSync(a.scenariosMd),
    );
    for (const agent of agents) {
      const scenarios = parseScenarios(agent.scenariosMd);
      const results = scenarios.map((s) =>
        mode === "gemini"
          ? evaluateScenarioGemini(agent, s, execFn)
          : evaluateScenarioDeterministic(agent, s),
      );
      const ok = results.length > 0 && results.every((r) => r.passed);
      logFn(
        `[${ok ? "PASS" : "FAIL"}] ${agent.name} (${results.length} scenarios)`,
      );
      for (const r of results) {
        logFn(`  - ${r.passed ? "PASS" : "FAIL"}: ${r.title} (${r.reason})`);
      }
      if (!ok) exitCode = 1;
    }
  }
  if (useSelfTest) {
    const lab = runSelfTest(repoRoot);
    logFn(JSON.stringify(lab, null, 2));
  }
  return exitCode;
}

if (path.resolve(process.argv[1] ?? "") === __filename) {
  process.exit(main());
}
