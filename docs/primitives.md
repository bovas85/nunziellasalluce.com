# Primitives Catalog

Core building blocks, code roots, and active ADRs. Any PR that adds or reshapes
a primitive, or writes or supersedes an ADR, must update the matching `adrs`
list in the same PR.

## 1. Nuxt Portfolio Pages & UI

- **Roots:** `app/pages/`, `app/components/`, `app/layouts/`, `app/assets/`
- **Role:** Portfolio pages, homepage work carousel, About CV preview, contact
  form, and responsive SCSS styling.
- **adrs:**
  - [`docs/adr/0001-mandatory-ui-visual-testing-and-evidence.md`](adr/0001-mandatory-ui-visual-testing-and-evidence.md)

## 2. WordPress Headless CMS Proxy

- **Roots:** `nuxt.config.ts` (`routeRules`, `nitro:config` prerender),
  `app/assets/config.js`, `app/types/`
- **Role:** Fetches pages, case studies, and Contact Form 7 submissions from
  `nunziella.moustachedesign.fyi/wp-json`.
- **adrs:**
  - [`docs/adr/0003-hosting-auth-and-branch-boundaries.md`](adr/0003-hosting-auth-and-branch-boundaries.md)

## 3. Protected Case Study Edge Auth

- **Roots:** `server/routes/api/verify-access.get.ts`,
  `server/routes/api/verify-access.post.ts`, `server/utils/auth.ts`,
  `app/components/UI/CaseStudyPasswordGate.vue`, `app/pages/[work].vue`,
  `app/pages/private.vue`
- **Role:** Validates `CASE_STUDY_PASSWORD` at the Nitro/Cloudflare edge and
  issues an HTTP-only SHA-256 cookie.
- **adrs:**
  - [`docs/adr/0001-mandatory-ui-visual-testing-and-evidence.md`](adr/0001-mandatory-ui-visual-testing-and-evidence.md)
  - [`docs/adr/0003-hosting-auth-and-branch-boundaries.md`](adr/0003-hosting-auth-and-branch-boundaries.md)

## 4. Cloudflare Workers Hosting & KV Storage (Alchemy)

- **Roots:** `alchemy.run.ts`, `.github/workflows/deploy-cloudflare.yml`,
  `tools/cleanup-cloudflare-previews.mjs`
- **Role:** Deploys the Nuxt stack (`NunziellaSalluceSite`) and
  `ContactSubmissions` KV namespace to Cloudflare Workers (prod + pinned PR
  previews with automatic PR-close cleanup).
- **adrs:**
  - [`docs/adr/0003-hosting-auth-and-branch-boundaries.md`](adr/0003-hosting-auth-and-branch-boundaries.md)

## 5. Health, Verification & Control CLI

- **Roots:** `server/routes/health.get.ts`,
  `server/routes/health.json.get.ts`, `server/utils/health.ts`,
  `tools/control-nunziella.mjs`, `tools/verify-deploy-health.mjs`,
  `tools/verify-kv-restore.mjs`, `tools/verify-*-visual.mjs`
- **Role:** Exposes `/health` and `/health.json`, runs local and preview
  checks, verifies deployed SHA, and checks KV recovery.
- **adrs:**
  - [`docs/adr/0001-mandatory-ui-visual-testing-and-evidence.md`](adr/0001-mandatory-ui-visual-testing-and-evidence.md)

## 6. Autonomous Issue Triage & PR Lifecycle

- **Roots:** `.github/workflows/issue-triage.yml`,
  `.github/workflows/legacy-reaper.yml`, `.github/workflows/keep-tests-tight.yml`,
  `.github/workflows/docs-freshness.yml`, `.github/workflows/friction-sweep.yml`,
  `.github/workflows/errors-to-issues.yml`, `.github/scripts/issue-triage.cjs`,
  `.github/ship-pr.json`, `.github/ISSUE_TEMPLATE/`, `.agents/skills/`
- **Role:** Classifies issues (`P0`–`P3`, door, complexity, `needs-human`),
  tracks friction/cleanup, and enforces subagent review + human merge.
- **adrs:**
  - [`docs/adr/0002-autonomous-monitoring-and-triage-for-agent-ready-pull-requests.md`](adr/0002-autonomous-monitoring-and-triage-for-agent-ready-pull-requests.md)
  - [`docs/adr/0003-hosting-auth-and-branch-boundaries.md`](adr/0003-hosting-auth-and-branch-boundaries.md)
