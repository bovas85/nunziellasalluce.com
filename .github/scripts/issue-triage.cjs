module.exports = async function triageIssue({ github, context, core }) {
  const issue = context.payload.issue;
  const title = issue.title || '';
  const body = issue.body || '';
  const existingLabels = (issue.labels || []).map(l => (l.name || '').toLowerCase());
  const fullText = `${title}\n${body}`.toLowerCase();

  const isCleanup =
    existingLabels.includes('cleanup') ||
    title.toLowerCase().startsWith('chore(cleanup)') ||
    fullText.includes('## standardized cleanup specification') ||
    (fullText.includes('ready when') && fullText.includes('how to verify'));
  const isCleanupReady = existingLabels.includes('cleanup-ready');
  const isFriction =
    existingLabels.includes('friction') ||
    title.toLowerCase().startsWith('friction:') ||
    fullText.includes('## standardized friction log') ||
    (fullText.includes('what happened') && fullText.includes('how to reproduce'));

  // 1. Reversibility & Door Type
  const oneWayIndicators = [
    'drop table',
    'drop column',
    'delete database',
    'database migration',
    'schema migration',
    'pricing change',
    'billing tier',
    'payment processing',
    'stripe webhook migration',
    'auth breaking change',
    'api breaking change',
    'deprecate endpoint',
    'remove domain',
    'dns change',
    'infrastructure teardown',
    'irreversible'
  ];

  const matchedOneWay = oneWayIndicators.filter(kw => fullText.includes(kw));
  const isOneWayDoor = matchedOneWay.length > 0;
  const doorLabel = isOneWayDoor ? 'one-way-door' : 'two-way-door';
  const doorTypeDesc = isOneWayDoor
    ? 'Single Entry / Major Irreversible Change'
    : 'Double Entry / Easily Reversible';

  // 2. Complexity Level Categorisation (Feasibility Matrix)
  const hardIndicators = [
    'architecture',
    'major refactor',
    'refactor entire',
    'redesign auth',
    'multi-tenant',
    'distributed',
    'concurrency',
    'deadlock',
    'high load',
    'complex state',
    'breaking change',
    'cross-cutting',
    'deep overhaul',
    'security audit required',
    'rfc',
    'proposal',
    'needs human',
    'decision needed',
    'pricing',
    'billing',
    'legal'
  ];
  const matchedHard = hardIndicators.filter(kw => fullText.includes(kw));

  const easyIndicators = [
    'style',
    'css',
    'color',
    'typography',
    'font',
    'spacing',
    'padding',
    'margin',
    'button',
    'text',
    'typo',
    'copy',
    'icon',
    'tooltip',
    'alt text',
    'aria',
    'cleanup',
    'lint',
    'prettier',
    'format'
  ];
  const matchedEasy = easyIndicators.filter(kw => fullText.includes(kw));
  const isEasyPrefix = /^(fix\((style|css|copy|typo)\)|chore\((deps|lint|format|cleanup)\)|docs:)/i.test(title);

  let complexityLevel;
  let complexityRationale;

  if (matchedHard.length > 0 || isOneWayDoor) {
    complexityLevel = 'hard';
    complexityRationale = isOneWayDoor
      ? `High complexity driven by one-way door characteristics (${matchedOneWay.join(', ')}).`
      : `High complexity / cross-cutting indicators detected (${matchedHard.join(', ')}).`;
  } else if (matchedEasy.length > 0 || isEasyPrefix) {
    complexityLevel = 'easy';
    complexityRationale = 'Low cognitive load: isolated UI, styling, copy, cleanup, or self-contained defect fix.';
  } else {
    complexityLevel = 'moderate';
    complexityRationale = 'Moderate complexity: contained multi-file component logic, route, or endpoint integration.';
  }

  const complexityLabel = `complexity:${complexityLevel}`;

  // 3. Autonomy Rating & Auto-Pickup Determination (Feasibility Matrix)
  // Any Two-Way Door of Easy or Moderate complexity (excluding Hard) is eligible unless held as deferred cleanup.
  let autonomyLabel;
  let autonomyRationale;
  let isAutoPickupEligible;

  if (isOneWayDoor) {
    autonomyLabel = 'needs-human';
    autonomyRationale = `One-way door detected (${matchedOneWay.join(', ')}). Irreversible architectural or state changes require explicit human consultation.`;
    isAutoPickupEligible = false;
  } else if (complexityLevel === 'hard') {
    autonomyLabel = 'needs-human';
    autonomyRationale = `Two-way door but hard complexity level (${matchedHard.join(', ')}). Requires human architecture review and decomposition before pickup.`;
    isAutoPickupEligible = false;
  } else if (body.trim().length < 40 && !title.toLowerCase().startsWith('fix')) {
    autonomyLabel = 'needs-human';
    autonomyRationale = `Issue specification is brief (${body.trim().length} chars). Requires clearer acceptance criteria before agent pickup.`;
    isAutoPickupEligible = false;
  } else {
    autonomyLabel = 'agent-ready';
    autonomyRationale = `Two-way door with ${complexityLevel} complexity. Well-bounded blast radius and verifiable via automated Vitest/Playwright suites and Cloudflare preview.`;
    isAutoPickupEligible = !isCleanup || isCleanupReady;
  }

  // 4. Feature Flaggability Verification
  const isFlaggable = !isCleanup;
  const cleanTitleWords = title
    .replace(/^(feat|fix|perf|refactor|chore|test|friction)(\([^)]+\))?:\s*/i, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  const flagName = `enable${cleanTitleWords || 'Feature'}`;
  const envVarName = `ENABLE_${cleanTitleWords.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '') || 'FEATURE'}`;

  // 5. Ensure Labels Exist & Apply to Issue
  const labelDefinitions = [
    { name: 'agent-ready', color: '0e8a16', description: 'Defined requirements, deterministic verification, autonomous execution' },
    { name: 'needs-human', color: 'fbca04', description: 'Requires human architectural, financial, or scope decision' },
    { name: 'two-way-door', color: '1d76db', description: 'Easily reversible / feature-flaggable change' },
    { name: 'one-way-door', color: 'b60205', description: 'Irreversible or high blast-radius architectural migration' },
    { name: 'complexity:easy', color: '0e8a16', description: 'Low complexity: isolated UI, styling, typography, or simple bugfix' },
    { name: 'complexity:moderate', color: 'fbca04', description: 'Moderate complexity: contained multi-file feature or endpoint' },
    { name: 'complexity:hard', color: 'd93f0b', description: 'High complexity: cross-cutting, deep architecture, or heavy state' },
    { name: 'friction', color: 'e99695', description: 'Operational or developer-experience friction encountered during work' },
    { name: 'cleanup', color: 'c5def5', description: 'Deferred legacy/migration cleanup with Ready when and How to verify' },
    { name: 'cleanup-ready', color: '0e8a16', description: 'Cleanup prerequisite verified; safe for removal PR' }
  ];

  for (const lbl of labelDefinitions) {
    try {
      await github.rest.issues.createLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        name: lbl.name,
        color: lbl.color,
        description: lbl.description
      });
    } catch {
      // Label already exists
    }
  }

  const labelsToApply = [doorLabel, autonomyLabel, complexityLabel];
  if (isFriction) labelsToApply.push('friction');
  if (isCleanup) labelsToApply.push('cleanup');

  try {
    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      labels: [...new Set(labelsToApply)]
    });
  } catch (err) {
    if (core && core.warning) {
      core.warning(`Failed to add labels: ${err.message}`);
    }
  }

  const issueTypeLabel = isCleanup ? 'cleanup' : (isFriction ? 'friction' : 'standard');
  const autoPickupCell = (isCleanup && !isCleanupReady)
    ? '⏳ **HELD FOR CLEANUP VERIFICATION**'
    : (isAutoPickupEligible ? '🚀 **AUTO-PICKUP ACTIVE**' : '⏸️ **AWAITING HUMAN DECISION**');
  const autoPickupNote = (isCleanup && !isCleanupReady)
    ? 'Deferred cleanup issue: held until scheduled verification confirms `How to verify` passes (promote with `cleanup-ready`).'
    : (isAutoPickupEligible ? 'Any Two-Way Door of Easy or Moderate complexity is auto-claimed by agent daemon.' : 'Hard complexity or One-Way Door: paused for explicit human consultation.');

  // 6. Post Structured Feasibility & Triage Comment
  const commentBody = `### 🧭 Automated Issue Triage & Feasibility Matrix

| Dimension | Classification | Assessment & Rationale |
| :--- | :--- | :--- |
| **Issue Type** | \`${issueTypeLabel}\` | ${isCleanup ? 'Deferred legacy/migration cleanup' : (isFriction ? 'Standardized friction report' : 'Standard feature or defect')} |
| **Door Classification** | \`${doorLabel}\` | ${doorTypeDesc} |
| **Complexity Level** | \`${complexityLabel}\` | ${complexityRationale} |
| **Autonomy Rating** | \`${autonomyLabel}\` | ${autonomyRationale} |
| **Auto-Pickup Status** | ${autoPickupCell} | ${autoPickupNote} |

---

#### 1. Feature Flaggability: ${isFlaggable ? 'Verified (`YES`)' : 'Not Applicable (`NO`)'}
• **Recommended Flag:** \`${flagName}\`  
• **Nuxt 4 / Cloudflare Runtime Config:**
\`\`\`ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      ${flagName}: process.env.${envVarName} ?? true
    }
  }
})
\`\`\`
• **Safety Fallback:** If \`${flagName}: false\`, system safely falls back to previous behavior, ensuring zero disruption.

---

### 📋 Proposed 5-Point Agreement Protocol
1. **Scope:** ${title}
2. **Desired Outcome:** Implement and verify specified changes without regressions.
3. **Boundaries / Invariants:**
   • Host target: Cloudflare Workers via Alchemy (never Netlify).  
   • Never merge autonomously; all PRs must await human review and merge by \`bovas85\`.
4. **Deterministic Proof:** \`CI=1 yarn test:coverage\` and \`yarn lint:all\` must pass 100% green; Cloudflare deploy preview generated on PR.
5. **Post-Release Observation:** 7-day health check observation against \`/health.json\`.

---

#### 🏁 Next Action
${(isCleanup && !isCleanupReady)
  ? '⏳ **Held for verification:** This cleanup issue remains paused until its `How to verify` condition passes and `cleanup-ready` is applied.'
  : (isAutoPickupEligible
    ? '🚀 **Auto-pickup in progress:** This issue meets the Feasibility Matrix criteria for autonomous execution (`two-way-door` + `easy`/`moderate` complexity). The agent daemon (`github-doorbell`) will automatically claim this issue, create a feature branch, implement changes, and open a PR for `bovas85` review.'
    : '⏸️ **Awaiting human decision:** This issue requires review or clarification from `bovas85` before code implementation begins.')}
`;

  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: commentBody
  });
};
