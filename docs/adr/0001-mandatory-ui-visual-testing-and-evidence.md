# ADR 0001: Mandatory Visual Testing and Media Evidence for User Interface Changes

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** Engineering & Product Leadership, Repository Maintainers
- **Scope:** Universal across all repositories containing user-facing UI,
  web applications, design systems, and frontend components.

## Context and Problem Statement

Pull requests across frontend codebases, web applications, and component
libraries frequently introduce or modify user-facing interfaces (e.g.,
authentication gates, forms, navigation systems, interactive widgets, modal
dialogs, and responsive layouts). While automated unit tests, component specs,
and static analysis successfully verify business logic and DOM structure, they
fail to verify the actual visual experience, motion, and layout rendered to a
human user.

Relying solely on code diffs and unit tests for UI changes creates significant
operational problems:

1. **Blind Reviews:** Reviewers cannot assess visual appeal, typography,
   color contrast, visual alignment, or responsive adaptations directly from
   source code changes.
2. **Review Delays:** Reviewers must either pull and build branches locally,
   wait for staging deployments, or merge without verifying the visual outcome,
   causing round-trips and delays.
3. **Undetected Visual & Responsive Regressions:** Breakages on specific device
   viewports (especially mobile Safari and touch devices), subtle layout shifts,
   and broken animation states often slip into production unnoticed.
4. **Lack of Interaction Proof:** A static snapshot or code assertion cannot
   demonstrate that a multi-step user flow (e.g., loading states, validation
   errors, transition animations, and success views) actually works in motion.

## Decision Drivers

- **Universal Review Transparency:** Reviewers and maintainers must see the
  exact visual outcome and interaction flow directly inside the pull request
  description on any device.
- **Deterministic Local Reproducibility:** Anyone checking out a branch must
  be able to execute a single, reproducible local command to run the visual
  verification flow without manual browser juggling or external dependencies.
- **Mandatory Multi-Viewport Verification:** Every UI component or layout
  change must be visually validated on both desktop and mobile viewports.
- **Evidence in Motion:** Dynamic interactions, state transitions, loading
  indicators, and validation states must be demonstrated in motion via
  animated walkthrough recordings or video.
- **Repository Hygiene:** Media assets must adhere to strict optimization
  standards so that repository clone times and disk footprints remain lean.

## Considered Options

1. **Code Diffs & Unit Tests Only (Status Quo):** Rely entirely on Vitest,
   Jest, or React/Vue Testing Library with Happy DOM/JSDOM, leaving visual
   inspection to ad-hoc manual verification on staging or deploy previews.
2. **Mandatory Visual Testing and Media Evidence (Chosen):** Require an
   automated, reproducible visual test harness (e.g., Playwright or Puppeteer)
   and committed, optimized media evidence for every pull request that touches
   user-facing UI.

## Decision Outcome

Chosen Option: **Option 2 — Mandatory Visual Testing and Media Evidence**.

Across all repositories, any pull request that introduces, refactors, or
modifies user-facing UI, styles, templates, or layouts MUST comply with the
following four-part standard:

### 1. Automated Reproducible Visual Test

Every repository containing UI must maintain an executable visual test runner
(typically registered in package scripts as `test:visual`, e.g.,
`npm run test:visual` or `yarn test:visual`, or implemented via a standalone
script in `tools/` or `tests/visual/`):

- **Local Execution:** The test must be executable locally without requiring
  remote staging servers or production databases.
- **Staging/Preview Support:** The runner should accept an optional `--url`
  parameter to enable execution against live deploy previews or staging URLs.
- **Automation Engine:** Use an automated headless browser runner (such as
  Playwright) that exercises the real browser rendering engine.

### 2. Multi-Viewport & State Coverage

The visual verification suite must exercise and record all critical viewports
and interactive states:

- **Desktop Viewport:** Standard desktop canvas (e.g., 1280x800).
- **Mobile Viewport:** Standard mobile device perspective (e.g., 390x844
  mobile Safari / touch viewport) to guarantee responsive layout integrity.
- **Dynamic Interaction States:**
  - Initial / default state.
  - Interactive feedback (focus, active, and hover states).
  - Validation error feedback and alert banners.
  - Loading, submitting, or pending states.
  - Final success or unlocked transition.

### 3. Media Evidence Artifacts

The visual verification run must produce standardized, committed media files
stored in the repository's asset directory (e.g., `.github/assets/`):

- **Animated Walkthrough (Preferred):** An animated looping GIF or video
  demonstrating the complete user flow in motion from initial state through
  interaction to completion.
- **Static Keyframe Screenshots:** High-resolution PNGs capturing distinct
  states (desktop default, mobile viewport, error/alert state, and success
  view).

### 4. Pull Request Submission Protocol

Every pull request modifying UI must include the following in its description:

1. **Embedded Animated Walkthrough:** The animated GIF or video displayed
   prominently at the top of the PR description.
2. **Screenshot Gallery:** A clear comparison or multi-viewport gallery
   showing desktop and mobile renderings.
3. **Reproduction Command:** The exact local command reviewers can execute
   to reproduce the test locally:

   ```bash
   npm run test:visual
   ```

## Media Optimization Standards

To ensure repository efficiency and prevent bloat, all visual media assets
must adhere to strict optimization guidelines:

- **Dimensions:** Walkthrough GIFs must be scaled to a maximum width of 800px.
- **Color Palette:** GIFs generated with tools such as `ffmpeg` must utilize
  two-pass palette generation (`palettegen` / `paletteuse`) with dithering to
  achieve crisp typography and graphics without color banding.
- **File Size Ceiling:** Animated walkthrough GIFs must remain under 1MB. For
  longer or higher-fidelity flows exceeding 1MB, an MP4/WebM video or an
  externally hosted asset must be used instead.
- **Format Selection:**
  - **PNG:** For static state screenshots.
  - **GIF (Optimized):** For standard UI interactions and PR embeds (< 1MB).
  - **MP4 / WebM:** For extended recordings or complex media flows.

## Scope and Applicability

- **Applies to:** Any pull request modifying client-side templates, styles
  (CSS/SCSS/Tailwind), visual component libraries, forms, layouts, themes, or
  visual workflows across all repositories.
- **Exempt from:** Pure backend services, headless APIs without frontends,
  data migrations, internal CLI tools without GUI output, and documentation-only
  changes.
