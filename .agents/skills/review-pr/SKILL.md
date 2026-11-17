---
name: review-pr
description:
  Independent PR review checklist for medium and high risk PRs. Always run in a
  fresh subagent, never by the agent that authored the code.
---

# Independent PR Review (`medium` & `high`)

1. Read the PR diff against `origin/main` and the PR's **Intent**, **Door**,
   **Testing**, and **System recap**.
2. **Test-expectation scrutiny:** inspect every modified test assertion
   (`*.spec.ts`, `tools/*.mjs`). Verify expectations were not weakened to make
   broken code pass; confirm changes match the stated intent.
3. **Hard boundary check (`AGENTS.md` & ADR 0003):**
   - No direct pushes to `main` or autonomous merge logic.
   - No Netlify production/preview restoration.
   - No secrets, tokens, or real `CASE_STUDY_PASSWORD` values in diffs.
   - Edge auth stays in `server/utils/auth.ts` / `/api/verify-access`.
4. **Proof & primitives check:**
   - `yarn verify` passed.
   - UI changes include ADR 0001 multi-viewport proof and `browse --record`.
   - Primitive/ADR changes updated `adrs` in `docs/primitives.md`.
   - New flags are listed in `docs/feature-flags.md` with owner + removal
     condition.
5. Return concise findings (`blocking` vs `non-blocking`) with exact file:line
   references so the coding agent can fix them before handing off to `bovas85`.
