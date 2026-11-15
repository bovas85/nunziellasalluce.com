module.exports = async function triageIssue({ github, context, core }) {
  const issue = context.payload.issue;
  const title = issue.title || '';
  const body = issue.body || '';
  const fullText = `${title}\n${body}`.toLowerCase();

  // 1. Reversibility & Door Type (Kent C. Dodds S03 Framework)
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

  // 2. Feature Flaggability Verification
  // Kent's Rule: Feature flags turn One-Way Doors into Two-Way Doors.
  const isFlaggable = true;
  const cleanTitleWords = title
    .replace(/^(feat|fix|perf|refactor|chore|test)(\([^)]+\))?:\s*/i, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  const flagName = `enable${cleanTitleWords || 'Feature'}`;
  const envVarName = `ENABLE_${cleanTitleWords.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '') || 'FEATURE'}`;

  // 3. Autonomy & Complexity Rating (ADR 0002)
  const needsHumanKeywords = [
    'rfc',
    'proposal',
    'needs human',
    'decision needed',
    'architecture review',
    'pricing',
    'billing',
    'legal',
    'security audit required',
    'design exploration'
  ];
  const matchedNeedsHuman = needsHumanKeywords.filter(kw => fullText.includes(kw));

  let autonomyLabel;
  let autonomyRationale;

  if (isOneWayDoor) {
    autonomyLabel = 'needs-human';
    autonomyRationale = `One-way door detected (${matchedOneWay.join(', ')}). Irreversible architectural or state changes require explicit human consultation.`;
  } else if (matchedNeedsHuman.length > 0) {
    autonomyLabel = 'needs-human';
    autonomyRationale = `Explicit human decision or architectural scope requested (${matchedNeedsHuman.join(', ')}).`;
  } else if (body.trim().length < 40 && !title.toLowerCase().startsWith('fix')) {
    autonomyLabel = 'needs-human';
    autonomyRationale = `Issue specification is brief (${body.trim().length} chars). Requires clearer acceptance criteria before agent pickup.`;
  } else {
    autonomyLabel = 'agent-ready';
    autonomyRationale = 'Defined scope, bounded blast radius, and verifiable via Vitest/Playwright deterministic test suites and Cloudflare preview.';
  }

  // 4. Apply Labels
  try {
    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      labels: [doorLabel, autonomyLabel]
    });
  } catch (err) {
    if (core && core.warning) {
      core.warning(`Failed to add labels: ${err.message}`);
    }
  }

  // 5. Post Structured Triage Comment
  const commentBody = `### 🧭 Automated Issue Triage & Reversibility Rating (Kent C. Dodds S03 Framework)

#### 1. Autonomy & Complexity Rating: \`${autonomyLabel}\`
• **Assessment:** ${autonomyRationale}  
• **Standard:** Evaluated under [ADR 0002](https://github.com/bovas85/mega/blob/main/docs/decisions/0002-agent-ready-vs-needs-human.md) and [ADR 0008](https://github.com/bovas85/mega/blob/main/docs/decisions/0008-automated-issue-triage-and-reversibility-doors.md).

#### 2. Reversibility & Door Type: \`${doorLabel}\` (${doorTypeDesc})
• **Door Analysis:** ${isOneWayDoor ? `This change involves potential one-way door characteristics (${matchedOneWay.join(', ')}). High blast-radius or irreversible state change.` : `This change is a two-way door. It can be rolled back cleanly via git revert or disabling the feature flag without data destruction.`}  
• **Kent's Rule:** In S03, Kent highlights that two-way doors are safe for rapid iteration and agent execution, whereas one-way doors must stop for explicit human sign-off.

#### 3. Feature Flaggability: Verified (\`${isFlaggable ? 'YES' : 'NO'}\`)
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

### 📋 Proposed 5-Point Agreement Protocol Draft (AGENTS.md / ADR 0004)
1. **Scope:** ${title}
2. **Desired Outcome:** Implement and verify specified changes without regressions.
3. **Boundaries / Invariants:**
   • Host target: Cloudflare Workers via Alchemy (never Netlify).  
   • Never merge autonomously; all PRs must await human review and merge by \`bovas85\`.
4. **Deterministic Proof:** \`CI=1 yarn test:coverage\` and \`yarn lint:all\` must pass 100% green; Cloudflare deploy preview generated on PR.
5. **Post-Release Observation:** 7-day health check observation against \`/health.json\`.

---

#### 🏁 Next Action
${autonomyLabel === 'agent-ready' && doorLabel === 'two-way-door'
  ? '✅ **Eligible for autonomous development:** `bovas-bot` or agent may create a feature branch, implement the feature flag, write deterministic tests, and open a PR for `bovas85` review.'
  : '⏸️ **Awaiting human decision:** This issue requires review or clarification from `bovas85` before code implementation begins.'}
`;

  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: commentBody
  });
};
