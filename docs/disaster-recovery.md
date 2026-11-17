# Disaster Recovery Runbook: nunziellasalluce.com

This runbook outlines standard operating procedures for diagnosing production
incidents, rolling back faulty releases, and restoring service for
`nunziellasalluce.com` on Cloudflare.

## 1. System Architecture

- **Domain:** <https://nunziellasalluce.com>
- **Hosting Platform:** Cloudflare Workers via Alchemy
  (`Cloudflare.Website.Nuxt`)
- **State & Data:** Cloudflare KV Namespace (`ContactSubmissions`)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy-cloudflare.yml`)
  triggered on push to `main`
- **Deploy Previews:** Cloudflare Workers via Alchemy (automated on PRs to
  `main`)
- **Health Verification:** `/health` (HTML dashboard) and `/health.json`
  (Nitro static endpoint)

## 2. Incident Detection & Monitoring

Failures are detected through:

1. **Automated Discord Webhook Alert:** The deploy guard prints a failure
   notification if post-deploy health check fails or times out.

2. **Post-Deploy Healthcheck Script:**

   ```bash
   node tools/verify-deploy-health.mjs --url "https://nunziellasalluce.com"
   ```

3. **Manual Endpoint Inspection:**

   ```bash
   curl -fsSL https://nunziellasalluce.com/health.json
   ```

## 3. Rollback Procedures

### Method A: Cloudflare Dashboard Rollback (Target RTO: < 1 minute)

This is the fastest method to instantly restore traffic to a previous working
deployment without waiting for a CI/CD build.

1. Open the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** -> **NunziellaSalluceSite**.
3. Select the **Deployments** tab.
4. Locate the last known-good deployment (verified commit SHA).
5. Click the three dots menu (**...**) next to the target deployment and select
   **Rollback to this deployment**.
6. Verify service restoration:

   ```bash
   node tools/verify-deploy-health.mjs --url "https://nunziellasalluce.com"
   ```

### Method B: Git Revert via CI/CD (Target RTO: ~ 2-3 minutes)

When standard version control history needs to record the rollback cleanly:

1. Checkout the latest `main` branch:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Revert the broken commit:

   ```bash
   git revert <BROKEN_COMMIT_SHA> -m 1
   git push origin main
   ```

3. GitHub Actions automatically executes
   `.github/workflows/deploy-cloudflare.yml`.
4. The workflow redeploys the Nuxt stack and executes the post-deploy health
   guard to verify restoration.

### Method C: Local Alchemy Emergency Deploy (Target RTO: ~ 2 minutes)

If GitHub Actions is unavailable or degraded:

1. Checkout the known-good commit locally:

   ```bash
   git checkout <LAST_GOOD_COMMIT_SHA>
   yarn install --ignore-engines
   ```

2. Deploy directly via Alchemy:

   ```bash
   CLOUDFLARE_ACCOUNT_ID="<ID>" CLOUDFLARE_API_TOKEN="<TOKEN>" yarn alchemy deploy --yes
   ```

3. Run the post-deploy verification:

   ```bash
   node tools/verify-deploy-health.mjs
   ```

## 4. Post-Incident Verification Checklist

After initiating any recovery action:

- [ ] Query `/health.json` and verify status is `"healthy"` and
      `commitSha` matches the rollback target.
- [ ] Run automated health and visual verification against production:

  ```bash
  node tools/verify-deploy-health.mjs --url "https://nunziellasalluce.com"
  ```

  And verify in a browser that `/`, `/about`, `/contact`, and case study routes
  render cleanly with zero console or network errors.

- [ ] Test the contact form submission endpoint to confirm Cloudflare KV
      connectivity.
- [ ] Document root cause and add regression tests before reproposing the
      reverted changes.
