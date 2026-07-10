# Nunziella Salluce Design

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1860f5a126ed43e6b4a24b61bd5fa37e)](https://app.codacy.com/gh/bovas85/nunziellasalluce.com/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Netlify Status](https://api.netlify.com/api/v1/badges/a709b57f-44b5-4522-9309-2bdc2978acfe/deploy-status)](https://app.netlify.com/sites/nunziellasalluce/deploys)

> Nuxt 4 + WordPress REST API for a portfolio site

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn preview

# generate static project for deployment
$ yarn generate
```

## Deployment

The static site is generated to `.output/public` and can be deployed to
any static hosting:

```bash
# preview deploy to Netlify (doesn't affect production)
$ npx netlify-cli deploy --dir=.output/public

# production deploy to Netlify
$ npx netlify-cli deploy --dir=.output/public --prod
```

## Codacy Static Analysis

The project integrates with Codacy for code quality, security, and
coverage reporting.

### AI Assistant Integration (MCP & Skills)

You can integrate Codacy code quality and security reviews directly into your
AI coding assistant (e.g., Cursor, VS Code, Windsurf, Claude Desktop, or
Gemini). For installation and setup instructions tailored to your specific
editor or AI model, refer to the
[Codacy Skills repository](https://github.com/codacy/codacy-skills).

### Local Analysis

You can run static analysis locally using the Codacy Analysis CLI:

```bash
# Initialize local configuration
$ npx @codacy/analysis-cli init

# Run analysis and view issues
$ npx @codacy/analysis-cli analyze
```

### Codacy Cloud Configuration Tuning

To tune the Codacy Cloud configuration in-place from the command line:

1. **Authenticate**: Make sure you have authenticated your local session
   with your Codacy API token:

   ```bash
   npx @codacy/codacy-cloud-cli login --token <your-api-token>
   ```

2. **Export Remote Config**: Fetch the current Cloud configuration to a local
   file:

   ```bash
   npx @codacy/analysis-cli init --remote gh bovas85 \
     nunziellasalluce.com --config-file .codacy/remote.config.json
   ```

3. **Optimize Config**: Edit `.codacy/remote.config.json` to enable/disable
   specific tools and patterns or tune parameters.
4. **Import to Cloud**: Reconcile the modified local configuration back to
   Codacy Cloud:

   ```bash
   npx @codacy/codacy-cloud-cli tools --import .codacy/remote.config.json
   ```

5. **Trigger Cloud Reanalysis**: Tell Codacy Cloud to reanalyze the
   repository using the new configuration:

   ```bash
   npx @codacy/codacy-cloud-cli repo --reanalyze-and-wait
   ```

## Nuxt Docs

For detailed explanation on how things work with Nuxt, check out the
[Nuxt documentation](https://nuxt.com/docs/getting-started/introduction).

## Special Thanks

Special thanks to [BrowserStack](https://www.browserstack.com) for
letting me use their service to debug browser specific issues.
