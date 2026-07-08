# Nunziella Salluce Design (Nuxt 4)

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

## Nuxt Docs

For detailed explanation on how things work with Nuxt, check out the
[Nuxt documentation](https://nuxt.com/docs/getting-started/introduction).

## Special Thanks

[![BrowserStack logo](https://3fxtqy18kygf3on3bu39kh93-wpengine.netdna-ssl.com/wp-content/themes/browserstack/img/browserstack-logo.svg)](https://www.browserstack.com)

Special thanks to [BrowserStack](https://www.browserstack.com) for
letting me use their service to debug browser specific issues.
