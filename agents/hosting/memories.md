# Hosting Memories

## Internal engineering

- **Cloudflare Workers via Alchemy only (never Netlify):** Legacy PR status
  contexts caused agents to assume Netlify. Production and PR deploy previews
  run solely on Cloudflare Workers via Alchemy. _(Receipt:
  `docs/adr/0003-hosting-auth-and-branch-boundaries.md`,
  `.github/workflows/deploy-cloudflare.yml`)_
- **Keep prod Worker name and KV title pinned:** `alchemy.run.ts` pins
  `PROD_WORKER_NAME` and `PROD_KV_TITLE` on the `prod` stage so CI adopts the
  existing Worker and `ContactSubmissions` KV namespace in-place without
  detaching `nunziellasalluce.com` or `www.nunziellasalluce.com`. _(Receipt:
  `alchemy.run.ts`)_
- **Edge auth stays out of WordPress ACF:** `CASE_STUDY_PASSWORD` is enforced
  in Nitro/Cloudflare secrets (`alchemy.run.ts` fails `prod` deploy if empty)
  and validated by `/api/verify-access`, never stored in WordPress ACF.
  _(Receipt: `docs/adr/0003-hosting-auth-and-branch-boundaries.md`,
  `alchemy.run.ts`)_
- **Branch, worktree, and merge boundaries:** Never push directly to `main`,
  never mutate the primary checkout directly (use a `git worktree` off
  `origin/main`), and never merge any PR autonomously (`bovas85` owns all
  merges). _(Receipt: `AGENTS.md`,
  `docs/adr/0003-hosting-auth-and-branch-boundaries.md`)_

## Customer facing

- **Edge-gated case studies:** Protected case studies require the HTTP-only
  cookie from `/api/verify-access`, while public portfolio pages and `/health` /
  `/health.json` remain unauthenticated. _(Receipt:
  `server/routes/api/verify-access.post.ts`, `docs/primitives.md`)_
