import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  discoverDomainAgents,
  evaluateScenarioDeterministic,
  evaluateScenarioGemini,
  globMatches,
  main,
  matchFiles,
  parseFrontmatter,
  parseScenarios,
  runSelfTest,
} from "./check-domain-agents.mjs";

const REPO_ROOT = path.resolve(__dirname, "..");

describe("Domain Agent router and scenarios", () => {
  it("routes hosting paths to the hosting Domain Agent only", () => {
    const hits = matchFiles(REPO_ROOT, [
      path.join(REPO_ROOT, "alchemy.run.ts"),
      ".github/workflows/deploy-cloudflare.yml",
      "app/pages/index.vue",
    ]);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.agent).toBe("hosting");
    expect(hits[0]?.matchedFiles).toEqual([
      ".github/workflows/deploy-cloudflare.yml",
      "alchemy.run.ts",
    ]);
  });

  it("passes all hosting scenarios and catches weakened markdown in lab", () => {
    const [hosting] = discoverDomainAgents(REPO_ROOT).filter(
      (a) => a.name === "hosting",
    );
    expect(hosting).toBeDefined();
    const scenarios = parseScenarios(hosting.scenariosMd);
    expect(scenarios.length).toBeGreaterThanOrEqual(3);
    for (const scenario of scenarios) {
      const verdict = evaluateScenarioDeterministic(hosting, scenario);
      expect(verdict.passed, verdict.reason).toBe(true);
    }
    const lab = runSelfTest(REPO_ROOT);
    expect(lab.selfTest).toBe("PASSED");
    expect(lab.weakenedFailed.length).toBeGreaterThanOrEqual(1);
  });

  it("handles frontmatter, glob edge cases, missing files, and CLI flags", () => {
    expect(parseFrontmatter("no frontmatter").owns).toEqual([]);
    expect(parseFrontmatter("---\nunclosed").owns).toEqual([]);
    expect(
      parseFrontmatter(
        "---\n# comment\nowns:\n- src/**\nmodel: flash\n---\nBody",
      ).owns,
    ).toEqual(["src/**"]);
    expect(globMatches("server/**", "server/routes/health.ts")).toBe(true);
    expect(globMatches("docs/**/a?.md", "docs/adr/ab.md")).toBe(true);
    expect(
      discoverDomainAgents(path.join(os.tmpdir(), "missing-dir-xyz")),
    ).toEqual([]);
    expect(
      parseScenarios(path.join(os.tmpdir(), "missing-scenarios.md")),
    ).toEqual([]);

    const emptyAgent = {
      glossaryMd: path.join(os.tmpdir(), "missing-glossary.md"),
      memoriesMd: path.join(os.tmpdir(), "missing-memories.md"),
      job: "Read-only expert.",
      model: "gemini-3.8-flash",
    };
    expect(
      evaluateScenarioDeterministic(emptyAgent, {
        title: "Empty",
        ask: "Q",
        expect: "A",
        never: "B",
      }).passed,
    ).toBe(false);

    const execPass = vi
      .fn()
      .mockReturnValueOnce(JSON.stringify({ response: "Cloudflare Workers" }))
      .mockReturnValueOnce(
        JSON.stringify({
          response: JSON.stringify({ passed: true, reason: "OK" }),
        }),
      );
    const geminiPass = evaluateScenarioGemini(
      emptyAgent,
      { title: "G", ask: "Ask", expect: "Expect", never: "Never" },
      execPass,
    );
    expect(geminiPass.passed).toBe(true);

    const execBad = vi
      .fn()
      .mockReturnValueOnce(JSON.stringify({ response: "Answer" }))
      .mockReturnValueOnce(JSON.stringify({ response: "not-json" }));
    expect(
      evaluateScenarioGemini(
        emptyAgent,
        { title: "G2", ask: "Ask", expect: "Expect", never: "Never" },
        execBad,
      ).passed,
    ).toBe(false);

    const logs = [];
    const logFn = (msg) => logs.push(msg);
    expect(
      main(["--match-files", "alchemy.run.ts"], REPO_ROOT, execPass, logFn),
    ).toBe(0);
    expect(main(["--all", "--self-test"], REPO_ROOT, execPass, logFn)).toBe(0);

    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "domain-cli-fail-"));
    try {
      const aDir = path.join(tmpRoot, "agents", "broken");
      fs.mkdirSync(aDir, { recursive: true });
      fs.writeFileSync(
        path.join(aDir, "agent.md"),
        "---\nowns:\n  - foo/**\n---\nJob",
      );
      fs.writeFileSync(
        path.join(aDir, "scenarios.md"),
        "## Fail\nAsk: Q\nExpect: MissingInvariant\nNever: Bad",
      );
      expect(main(["--all"], tmpRoot, execPass, logFn)).toBe(1);
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
    expect(logs.length).toBeGreaterThan(0);
  });
});
