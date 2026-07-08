# Migration Plan: v3 → Root

This document outlines the steps to promote the v3 folder to become the main
application, replacing the current Nuxt 2 codebase.

## Prerequisites

- [ ] All v3 features tested and verified on preview deployment
- [ ] Performance metrics acceptable
- [ ] SEO/meta tags validated
- [ ] All pages rendering correctly
- [ ] WordPress API integration working
- [ ] Forms and contact functionality tested

## Phase 1: Backup & Preparation

1. **Create backup branch**
   ```bash
   git checkout -b backup/nuxt-2-final
   git push origin backup/nuxt-2-final
   ```

2. **Tag current production**
   ```bash
   git tag -a v2-final -m "Final Nuxt 2 version"
   git push origin v2-final
   ```

3. **Document current deployment**
   - Note Netlify build command: `yarn generate`
   - Note publish directory: `dist`
   - Save environment variables
   - Export site settings

## Phase 2: File Structure Changes

### Files to Move from v3/ to Root

```bash
# Core application files
v3/app/                    → app/
v3/public/                 → public/
v3/nuxt.config.ts          → nuxt.config.ts
v3/tsconfig.json           → tsconfig.json
v3/package.json            → package.json
v3/yarn.lock               → yarn.lock

# Linting & tooling
v3/.stylelintrc.json       → .stylelintrc.json
v3/eslint.config.mjs       → eslint.config.mjs
v3/.husky/                 → .husky/

# Documentation
v3/README.md               → README.md (merge with existing)
```

### Files to Keep in Root

- `.gitignore` (update to remove old Nuxt 2 patterns)
- `.codacy.yml` (already configured)
- `.git/`

### Files to Archive/Remove

```bash
# Old Nuxt 2 files
acf-export-2019-04-25.json
nuxt.config.js
components/
layouts/
pages/
plugins/
store/
middleware/
assets/ (old)
static/ (old)
```

## Phase 3: Configuration Updates

### Update Root package.json

Replace with v3/package.json, ensuring:
- Project name: change from "v3" to "nunziellasalluce.com"
- Keep all dependencies from v3
- Keep lint scripts and pre-commit hooks
- Keep volta node version

### Update Netlify Configuration

**netlify.toml** (create if doesn't exist):
```toml
[build]
  command = "yarn generate"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "24.13.0"

[[redirects]]
  from = "/*"
  to = "/404"
  status = 404
```

### Update .gitignore

```gitignore
# Nuxt 4
.nuxt/
.output/
.nitro/

# Dependencies
node_modules/

# Environment
.env

# OS
.DS_Store
```

## Phase 4: Migration Steps

### Step 1: Clean Slate
```bash
git checkout main
git pull origin main
git checkout -b migration/promote-v3

# Remove old Nuxt 2 directories
mkdir archive
mv components layouts pages plugins store middleware archive/
mv assets static archive/
mv nuxt.config.js acf-export-2019-04-25.json archive/
```

### Step 2: Move v3 Contents
```bash
mv v3/app ./
mv v3/public ./
mv v3/nuxt.config.ts ./
mv v3/tsconfig.json ./
mv v3/package.json ./
mv v3/yarn.lock ./
mv v3/.stylelintrc.json ./
mv v3/eslint.config.mjs ./
mv v3/.husky ./

# Keep v3 folder temporarily for reference
mv v3 archive/v3-source
```

### Step 3: Update package.json
```bash
sed -i '' 's/"name": "v3"/"name": "nunziellasalluce.com"/' package.json
```

### Step 4: Reinstall & Test
```bash
rm -rf node_modules
yarn install
yarn nuxt prepare
yarn generate
yarn dev
```

### Step 5: Verify
- [ ] All pages load at localhost:3000
- [ ] Static generation produces HTML in .output/public
- [ ] Images load correctly from public/images
- [ ] Styles applied correctly
- [ ] Animations working
- [ ] Forms working
- [ ] Links navigating correctly

### Step 6: Commit & Push
```bash
git add -A
git commit -m "feat: promote Nuxt 4 to main application

- Moved v3 app structure to root
- Archived Nuxt 2 codebase
- Updated build configuration for Nuxt 4
- Updated linting and pre-commit hooks

BREAKING CHANGE: Application now uses Nuxt 4 architecture"

git push origin migration/promote-v3
```

## Phase 5: Deployment

### Option A: Preview First (Recommended)
1. Deploy migration branch to Netlify preview
2. Test thoroughly on preview URL
3. Merge to main after validation

### Option B: Direct Deploy
1. Merge migration branch to main
2. Monitor Netlify deploy
3. Have rollback plan ready

### Netlify Deploy Settings Update

| Setting | Current (Nuxt 2) | New (Nuxt 4) |
|---------|-------------------|--------------|
| Build command | `yarn generate` | `yarn generate` |
| Publish directory | `dist` | `.output/public` |

## Phase 6: Post-Migration

1. **Monitor production**
   - Check error logs in Netlify
   - Test all major user flows
   - Verify analytics tracking
   - Check SEO/sitemap

2. **Clean up**
   ```bash
   # After successful deploy, remove archive
   rm -rf archive/
   git commit -am "chore: remove archived Nuxt 2 code"
   git push origin main
   ```

## Rollback Plan

### Quick Rollback
```bash
# Revert the merge commit
git revert HEAD
git push origin main
```

### Full Rollback
```bash
# Restore from backup branch
git checkout backup/nuxt-2-final
git checkout -b hotfix/restore-nuxt-2
git push origin hotfix/restore-nuxt-2
```

### Netlify Settings Rollback
- Publish directory: change back to `dist`
- Redeploy previous successful build from Netlify UI

## Go-Live Checklist

- [ ] All pages render correctly
- [ ] Forms submit successfully
- [ ] Images load (check public/images paths)
- [ ] CSS animations working
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Performance metrics acceptable
- [ ] SEO meta tags present
- [ ] 404 page works
- [ ] WordPress API calls succeed
- [ ] Netlify deploy succeeds
- [ ] Preview deployment tested
- [ ] Rollback plan understood
