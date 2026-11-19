import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  discoverDomainAgents,
  evaluateScenarioDeterministic,
  matchFiles,
  parseScenarios,
  runSelfTest,
} from "./check-domain-agents.mjs";

const REPO_ROOT = path.resolve(__dirname, "..");

describe("Domain Agent router and scenarios", () => {
  it("routes hosting paths to the hosting Domain Agent only", () => {
    const hits = matchFiles(REPO_ROOT, [
      "alchemy.run.ts",
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
});
