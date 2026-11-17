# nunziellasalluce.com agent index

## Identity

You are an autonomous software engineering agent maintaining Nunziella Salluce's
portfolio (Nuxt 4, WordPress REST API, and Cloudflare Workers via Alchemy).

## Tools & Verification

Use `yarn` for project checks, `node tools/control-nunziella.mjs` for live app
proof, and `gh` for GitHub PRs and issues.

```sh
yarn verify
node tools/control-nunziella.mjs doctor && node tools/control-nunziella.mjs dev
node tools/control-nunziella.mjs health
```

`yarn verify` runs `nuxt prepare`, ESLint, Stylelint, Markdownlint, `vue-tsc`,
Prettier check, Feature Map check, and Vitest coverage. CI runs the same gate;
pre-commit runs `lint-staged` and pre-push runs fast static checks.

## Boundaries

Only `bovas85` may authorize exceptions in writing on the active PR or issue
thread before taking any action below:

- Push directly to `main` (stop and ask if a branch policy exception is needed).
- Merge any pull request (`bovas85` owns all merges; hand back when ready).
- Deploy production or previews to Netlify (target Cloudflare Workers via
  Alchemy until a new Architecture Decision Record (ADR) changes hosting).
- Store case-study passwords in WordPress ACF (keep `CASE_STUDY_PASSWORD` in
  Cloudflare and GitHub Secrets until a new ADR changes edge auth).
- Commit secrets, tokens, or `.env` values into code, issues, or PRs (abort
  and redact immediately if discovered).
- Self-review `medium` or `high` risk PRs with the coding agent (spawn an
  independent subagent using
  [`.agents/skills/review-pr/SKILL.md`](.agents/skills/review-pr/SKILL.md), or
  ask `bovas85` if subagent execution is unavailable).

## Map

- Self-verification CLI & Feature Map:
  [`control-nunziella`](.agents/skills/control-nunziella/SKILL.md)
- Primitives catalog (update `adrs` when changing primitives or ADRs):
  [`docs/primitives.md`](docs/primitives.md)
- Decisions (read before proposing big changes):
  [`docs/adr/README.md`](docs/adr/README.md)
- Feature flags & rollback runbook:
  [`docs/feature-flags.md`](docs/feature-flags.md),
  [`docs/disaster-recovery.md`](docs/disaster-recovery.md)
- Shipping a PR: [`ship-pr`](.agents/skills/ship-pr/SKILL.md)
- Reviewer checklist:
  [`review-pr`](.agents/skills/review-pr/SKILL.md)
- Filing friction: [`friction-log`](.agents/skills/friction-log/SKILL.md)
- Issue priority: `P0` > `P1` > `P2` > `P3` (work highest priority first).
- Human decisions: wait on `needs-human` issues until `bovas85` decides.
