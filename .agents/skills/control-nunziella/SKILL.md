---
name: control-nunziella
description:
  Use the control-nunziella CLI for every check of the running Nuxt application
  before claiming work is ready.
---

# control-nunziella

Use the CLI for every check of the running app. Verify locally first; use
`preview --pr` only for production-like changes.

## Commands

```sh
node tools/control-nunziella.mjs doctor
node tools/control-nunziella.mjs dev
CASE_STUDY_PASSWORD="..." node tools/control-nunziella.mjs login
node tools/control-nunziella.mjs request GET /health.json --contains '"healthy"'
node tools/control-nunziella.mjs execute --code-file <fixture.json>
node tools/control-nunziella.mjs browse --path / --record
node tools/control-nunziella.mjs map --check
node tools/control-nunziella.mjs preview --pr 252 --check /health.json
node tools/control-nunziella.mjs health --origin https://nunziellasalluce.com --sha HEAD
```

Add `--json` to any command for machine-readable output.

## Seed and Auth Notes

- **Public routes** (`/`, `/about`, `/contact`, `/privacy-policy`, `/health`):
  no login needed.
- **Protected case studies** (`/private`, slugs in `PROTECTED_CASE_STUDIES`):
  set `CASE_STUDY_PASSWORD` in `.env` or environment, then run `login`. Never
  commit real passwords into code, fixtures, or PR descriptions.
- **Feature Map**: [`references/features.json`](references/features.json)
  tracks all `app/pages/` and `server/routes/` endpoints. Run `map --check`
  whenever routes change.

## When to Use a Preview Deploy

Use `preview --pr <n>` only when the change needs Cloudflare Workers edge
bindings (`SUBMISSIONS` KV), Nitro route proxies/headers, Cloudflare Secrets, or
production build/SSR behavior not reproducible in local `dev`.

## Proof

Before opening or finishing a PR:

1. Run `yarn verify` (`nuxt prepare`, lint, typecheck, `map --check`, coverage).
2. Run `doctor`, then `dev`.
3. Exercise changed API/HTML routes with `request --contains` or `execute`.
4. For UI changes, run `browse --path <route> --record` (plus ADR 0001
   desktop/mobile visual checks) and cite the exact commands and artifacts under
   **Testing** in the PR description.
5. After merge, verify production with `health --sha <merge-sha>`.
