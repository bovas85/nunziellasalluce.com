# 0003: Hosting, Auth, and Branch Boundaries ("What Not To Do")

Status: Accepted
Date: 2026-11-17

## Decision

Agents and automated workflows must never:

1. **Push directly to `main`:** All changes land through feature branches and
   pull requests.
2. **Merge any PR autonomously:** Even `low`-risk PRs with green CI require
   explicit `bovas85` approval and merge (`autoMergeFor: []`).
3. **Deploy to Netlify:** Production and PR deploy previews run solely on
   Cloudflare Workers via Alchemy (`.github/workflows/deploy-cloudflare.yml`).
4. **Use WordPress ACF for case-study passwords:** Protected case study access
   is enforced at the Cloudflare/Nitro edge (`CASE_STUDY_PASSWORD` secret and
   `/api/verify-access`).
5. **Self-review `medium` or `high` PRs:** Always spawn an independent review
   subagent instead of using the agent that wrote the code.

## Why

Encoding hard "no" rules stops agents from re-proposing retired hosting setups,
bypassing human merge gates, weakening auth boundaries, or rubber-stamping
their own changes.

## Revisit If

- `bovas85` chooses to delegate `low`-risk merges to `.github/ship-pr.json`, or
  hosting moves away from Cloudflare Workers / Alchemy.
