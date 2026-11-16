# ADR 0001: Mandatory Visual Testing and Media Evidence for UI Pull Requests

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Alessandro Giordo (@bovas85), Antigravity (T3 Code)
- **Consulted:** Repository Maintainers

## Context and Problem Statement

Pull requests in `nunziellasalluce.com` that introduce or modify user-facing UI
components (e.g. password gates, buttons, navigation menus, previews, and
responsive layouts) frequently pass static linting and unit test coverage, yet
lack immediate visual proof of how the feature behaves in practice.

Without reproducible visual tests and captured visual media (animated
walkthrough GIFs, MP4 videos, or multi-viewport screenshots), reviewers cannot
quickly evaluate UI conformance, responsive adaptations, or dynamic state
transitions (such as error alerts, hover feedback, and loading states). This
causes unnecessary review round-trips, delays merge decisions, and increases the
risk of visual regressions on mobile devices (such as Safari iOS WebKit
quirks).

## Decision Drivers

- **Review Velocity:** Maintainers and reviewers must be able to inspect feature
  appearance and user interaction flow directly within the PR on any device.
- **Reproducibility:** Anyone checking out a branch or reviewing a PR must be
  able to run a deterministic local command (e.g. `yarn test:visual`) to
  reproduce the visual verification without requiring a live CMS or database.
- **Responsive Guarantee:** All UI features must visually verify both desktop
  and mobile viewports (e.g., iPhone 390x844).
- **Audit Trail:** Media artifacts committed under `.github/assets/` document the
  evolution of design tokens and UI components over time.

## Considered Options

1. **Unit and Snapshot Tests Only (Status Quo):** Test DOM structure with
   Vitest and Happy DOM, relying on manual manual verification on live deploy
   previews.
2. **Mandatory Visual Testing and Media Evidence (Chosen):** Require an
   automated visual test script (via Playwright) and committed visual media
   artifacts for any PR that introduces or touches user-facing UI.

## Decision Outcome

Chosen Option: **Option 2 — Mandatory Visual Testing and Media Evidence**.

Any pull request that introduces, refactors, or modifies user-facing UI,
styles, or layouts MUST adhere to the following protocol:

### 1. Automated Reproducible Visual Test

Every UI PR must provide an executable visual test runner (e.g., located under
`tools/verify-*-visual.mjs` or integrated into `yarn test:visual`) that uses
Playwright (or headless Chromium) to exercise the component or flow:

- Must support standalone local mock execution so reviewers can run it offline
  without external API/CMS dependencies.
- Must accept an optional `--url <DEPLOY_PREVIEW_URL>` flag to allow
  verifying live staging or Cloudflare deploy previews.

### 2. Multi-Viewport & Dynamic State Coverage

Visual tests must exercise and capture:

- **Desktop Viewport:** Standard 1280x800 desktop perspective.
- **Mobile Viewport:** Standard mobile device perspective (390x844 mobile
  Safari / iPhone).
- **State Progression:** All interactive states, including initial/default,
  focus/hover, validation error/alert, loading/verifying, and success/unlocked
  states.

### 3. Media Artifacts Committed to Repository

The visual test must generate and save media under `.github/assets/`:

- **Static State Screenshots:** High-resolution PNGs illustrating distinct
  states (e.g., `*-locked.png`, `*-error.png`, `*-mobile.png`).
- **Dynamic Walkthrough:** An animated looping GIF (preferred, < 1MB) or MP4
  video capturing the end-to-end user interaction sequence.

### 4. PR Description & Documentation Requirements

Every UI pull request must include:

- The embedded animated walkthrough GIF or video in the PR description.
- A summary table displaying side-by-side desktop and mobile screenshots.
- The exact local command for reviewers to reproduce the visual test locally:

  ```bash
  yarn test:visual
  ```

## Media Optimization Standards

To avoid repository bloat:

- **Dimensions:** Scale walkthrough GIFs to a maximum width of 800px.
- **Palette Optimization:** Use `ffmpeg` with two-pass palette generation
  (`palettegen` / `paletteuse`) and Lanczos scaling to preserve crisp typography
  without color banding.
- **File Size Target:** Animated GIFs must remain under 1MB whenever possible.

## Related PRs & Precedents

- **PR #240:** Embedded live CV live preview with walkthrough GIF
  (`.github/assets/cv-preview-walkthrough.gif`).
- **PR #243:** Normalized contact form button styling with before/after
  screenshots (`.github/assets/contact-form-button-*.png`).
- **PR #244:** Case study password gate with automated runner
  (`tools/verify-password-gate-visual.mjs`) and walkthrough GIF
  (`.github/assets/case-study-password-gate-walkthrough.gif`).
