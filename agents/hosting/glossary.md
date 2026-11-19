# Hosting Glossary

- **Prod Stage (`prod`):** The live Alchemy deployment stage that updates
  `PROD_WORKER_NAME` and `PROD_KV_TITLE` in-place so custom domains stay
  attached.
- **PR Preview Stage (`pr-<number>`):** An isolated Cloudflare Worker and KV
  stage deployed per pull request by `.github/workflows/deploy-cloudflare.yml`.
- **Edge Case-Study Auth (`CASE_STUDY_PASSWORD`):** Password validated at the
  Nitro/Cloudflare edge (`/api/verify-access`) that issues an HTTP-only SHA-256
  cookie; never stored in WordPress ACF.
- **Canonical Host (Cloudflare Workers via Alchemy):** The sole supported
  production and preview hosting platform for `nunziellasalluce.com`; Netlify
  is retired.
