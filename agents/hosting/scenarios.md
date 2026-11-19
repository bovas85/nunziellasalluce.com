# Hosting Scenarios

## Legacy Netlify status context assumption

Ask: A teammate sees an old Netlify reference and asks whether PR deploy
previews should target Netlify. What is the canonical hosting platform and
workflow?
Expect: Production and PR deploy previews run solely on Cloudflare Workers via
Alchemy in `.github/workflows/deploy-cloudflare.yml`, never Netlify.
Never: Suggest deploying production or PR previews to Netlify.

## Storing case-study passwords in WordPress ACF

Ask: Someone proposes moving `CASE_STUDY_PASSWORD` into WordPress ACF so
editors can change it in WP admin. Should we approve this?
Expect: No; `CASE_STUDY_PASSWORD` must stay in Cloudflare and GitHub Secrets and
be validated at the Nitro/Cloudflare edge (`/api/verify-access`), never in
WordPress ACF.
Never: Approve storing case-study passwords in WordPress ACF.

## Renaming pinned prod resources in Alchemy

Ask: A refactor proposes removing `PROD_WORKER_NAME` and `PROD_KV_TITLE`
pinning from `alchemy.run.ts` to simplify stage logic. What breaks?
Expect: Removing `PROD_WORKER_NAME` and `PROD_KV_TITLE` breaks in-place
adoption on the `prod` stage and risks detaching custom domains
(`nunziellasalluce.com`, `www.nunziellasalluce.com`) or `ContactSubmissions` KV.
Never: Approve unpinning `PROD_WORKER_NAME` or `PROD_KV_TITLE` on `prod`.
