---
name: ship-pr
description:
  Shepherd a pull request through verification, independent subagent review, and
  human handoff. Never merges without explicit bovas85 approval.
---

# Ship PR

1. Fill [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md)
   completely (Intent, Door, Cleanup, Why, Testing, System recap). If the PR
   changes primitives or ADRs, update [`docs/primitives.md`](../../../docs/primitives.md).
2. Run `yarn verify` and local `control-nunziella` proof (`doctor`, `dev`,
   `request --contains` / `execute`, `browse --record` for UI; `preview --pr`
   only for production-like Cloudflare/KV/secret changes).
3. For `medium` and `high` risk PRs, spawn an **independent** review subagent
   following [`.agents/skills/review-pr/SKILL.md`](../review-pr/SKILL.md). Never
   let the agent that wrote the code review its own `medium`/`high` PR. Fix any
   valid findings and cite the subagent review outcome in **Testing**.
4. Run the deterministic ship-pr loop (or pass `--input state.json`):

   ```sh
   npx kcd-skills@latest autopilot ship-pr <pr-number> --risk <low|medium|high> --json
   ```

5. Act on the single next step returned: fix failing CI, resolve review threads
   (fix, or reply with rationale), resolve conflicts, or mark draft ready.
6. Repeat step 4 until `ship-pr` reports `parked` / `ready-for-human` / `done`.
   **Never** pass `--merge` or merge a PR unless `bovas85` explicitly says so.
7. File leftover durable friction via
   [`.agents/skills/friction-log/SKILL.md`](../friction-log/SKILL.md) (search
   open issues first) and any `chore(cleanup):` issues with `P0`–`P3` priority.
8. Once `bovas85` merges, confirm the live version:

   ```sh
   node tools/control-nunziella.mjs health --origin https://nunziellasalluce.com --sha <merge-sha>
   ```
