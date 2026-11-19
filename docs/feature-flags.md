# Feature Flags Inventory

All runtime feature flags live in [`nuxt.config.ts`](../nuxt.config.ts) under
`runtimeConfig.public` and default to enabled unless explicitly turned off via
environment variables.

## Metrics Policy

No automated flag-metrics or telemetry SDK is active (`metrics: none`). Changes
are evaluated via manual observation, `/health.json`, and visual/CI checks.

## Active Flags

| Flag                               | Env Override                                                            | Owner     | Metric | Removal Condition                                                                            |
| :--------------------------------- | :---------------------------------------------------------------------- | :-------- | :----- | :------------------------------------------------------------------------------------------- |
| `enableCarouselSwipeFix`           | `ENABLE_PREVENT_TEXT_AND_BUTTON` / `ENABLE_CAROUSEL_SWIPE_FIX`          | `bovas85` | `none` | Remove after 14 days in production with zero carousel swipe regressions (`#247`).            |
| `ENABLE_PRIVATE_CASE_STUDY_ROUTE`  | `ENABLE_RESTORE_PRIVATE_CASE_STUDY` / `ENABLE_PRIVATE_CASE_STUDY_ROUTE` | `bovas85` | `none` | Remove after 14 days in production confirming `/private` route stability (`#246`).           |
| `enableCvLivePreview`              | `ENABLE_CV_LIVE_PREVIEW`                                                | `bovas85` | `none` | Remove once inline CV preview is verified stable across desktop and mobile Safari (`#238`).  |
| `enableNormalizeContactFormButton` | `ENABLE_NORMALIZE_CONTACT_FORM_BUTTON`                                  | `bovas85` | `none` | Remove after 14 days in production confirming iOS Safari submit button contrast (`#241`).    |
| `enableDesktopBurgerMenu`          | `ENABLE_DESKTOP_BURGER_MENU`                                            | `bovas85` | `none` | Remove after 14 days in production confirming desktop burger menu toggle stability (`#263`). |
| `enableAboutBgQualityFix`          | `ENABLE_ABOUT_BG_QUALITY_FIX` / `ENABLE_PREVENT_PIXELATED_LOW_QUALITY`  | `bovas85` | `none` | Remove after 14 days in production confirming crisp About background rendering (`#273`).     |
| `protectedCaseStudies`             | `PROTECTED_CASE_STUDIES`                                                | `bovas85` | `none` | Permanent config flag (comma-separated protected case study slugs).                          |

## Cleanup Protocol

When a temporary rollout flag meets its removal condition, file a
`chore(cleanup):` issue using [`.github/ISSUE_TEMPLATE/cleanup.yml`](../.github/ISSUE_TEMPLATE/cleanup.yml)
so `legacy-reaper` can remove the flag and fallback branch.
