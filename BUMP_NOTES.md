# Bump Notes

## CURRENT VER= 0.4.2-alpha / PENDING VER= none

## Release Prep Completion - v0.4.2-alpha

- This repo still does not carry a repo-local authoritative version file; its release state remains inferred from the adjacent runtime release train and the now-aligned `v0.4.2-alpha` prep material.
- Release-note source material for this bump now lives in `changelog/v0.4.2-alpha.md`.
- No local prior release tag is present in this repo clone, so the compare range for GitHub release packaging could not be resolved to a true tag-to-tag span here and must be confirmed before publishing.
- Earlier sections below remain the cumulative milestone record for the FindMeHere rollout and surface-polish work behind this bump.

### Technical Notes

- This repo does not carry its own authoritative version file or runtime-export version mirror. The best grounded current-version value is therefore inferred from the adjacent StreamSuites runtime/export release train used by the surrounding surfaces, which is still `0.4.1-alpha`.
- `README.md` is already staged for `v0.4.2-alpha`, so version detection here is more ambiguous than in the other repos and should be treated as inferred rather than locally authored.
- Recent repo-visible work centered on the active FindMeHere shell in `js/findmehere-app.js` and `js/members-session.js`, with current code showing canonical root-slug routing, directory-first session tracking, live-status hydration, same-origin public profile fetching, and explicit page-visit analytics posting with `surface=directory`.
- Recent history also shows FindMeHere directory/session-related tightening in `index.html`, `js/findmehere-app.js`, and `js/members-session.js`, plus SEO/background asset refreshes that support the current public-facing presentation.

### Human-Readable Notes

- FindMeHere is being polished as a directory-first public surface with cleaner theme behavior, canonical slug routing, and live-status-aware profile presentation.
- This surface is now explicitly identified as the tracked `directory` surface for analytics/alerts purposes, so visits and request-backed activity from `findmehere.live` are expected to report distinctly in admin/runtime consumers.
- The recent changes are still mainly about correctness and surface polish rather than moving account/profile authority into this repo; account and profile authority still live outside this repo.
- This repo appears prepared for the upcoming `0.4.2-alpha` cycle, but it does not provide a fully local source-of-truth version marker to bump in this task.

### Files / Areas Touched

- `index.html`
- `js/findmehere-app.js`
- `js/members-session.js`
- `data/findmehere-directory.json`
- `data/live-status.json`
- `css/findmehere.css`
- `README.md`

### Follow-Ups / Risks

- Confirm whether FindMeHere should gain an explicit repo-local version mirror in a future cleanup; right now release-state detection depends on adjacent runtime authority and README copy.
- Reconcile the README `v0.4.2-alpha` prep wording with the still-inferred `0.4.1-alpha` current state during the actual bump pass.

## Session Milestone - 2026-03-20

### Surface Tracking + Session Capture

- `findmehere.live` / StreamSuites-Members was wired as its own distinct tracked analytics and alerting surface instead of being lumped into generic public traffic.
- The canonical internal surface code used by the session-tracking path is `directory`, and the admin-facing label paired with that surface is `FindMeHere Directory`.
- `js/members-session.js` now posts page-visit analytics through `/api/public/analytics/page-visit?surface=directory`, persists a directory-session marker, and reports request-backed activity for the directory/root-slug experience using that distinct surface identity.

### Human-Readable Impact

- Page visits, sessions, and request-backed alerts originating from `findmehere.live` are now expected to flow through runtime/admin reporting as a distinct FindMeHere surface instead of being mixed into broader public-site traffic.
- The repo continues to present a directory-first public experience, but that public surface is now also part of the cross-repo analytics/alerting model reflected in the runtime and admin notes for this same milestone.

## Session Milestone - 2026-03-20

### FindMeHere Surface Introduction + Iterative Branding Pass

- This repo is now the active public FindMeHere surface for `findmehere.live`, and that surface should be treated as part of the broader platform milestone rather than as a leftover members-only shim from the previous release line.
- The FindMeHere presentation moved through staged visual iterations rather than a single isolated tweak: initial public-surface introduction, premium dark-theme overhaul, typography/layout reductions, brand/header cleanup, and full light-theme expansion/polish.
- Current repo state shows the canonical root surface implemented from `index.html`, `js/findmehere-app.js`, and `css/findmehere.css`, with the public shell centered on directory-first discovery plus root-slug share pages.

### Theme / Visual System

- The active FindMeHere styling now follows the newer premium branding direction: black/charcoal base palette, metallic silver/steel typography and UI treatments, restrained red accenting, and more deliberate gradient/light layering instead of flatter earlier styling.
- An extremely subtle creator-style grid background treatment is now baked into the page shell, with restrained overlay/mask handling so it reads as texture instead of a loud pattern.
- The main shell/content width was widened for large-screen use via the FindMeHere-specific max-width system, so the directory/profile surfaces fill desktop layouts more confidently.
- Dark mode remains the default presentation, but the repo now also carries a full light-mode equivalent tuned to the same metallic/red brand direction rather than a simple flat repaint.
- Theme choice is persisted across reloads through the `fmh-theme` storage key and applied at boot before the page shell renders.

### Branding / Header / Typography

- The header now uses dedicated FindMeHere logo assets by breakpoint, with the larger wordmark treatment on wider layouts and the compact icon treatment on smaller screens.
- Header branding copy was updated from a plain `FINDMEHERE` treatment to `FINDMEHERELIVE`, with the `LIVE` segment receiving the red accent treatment.
- Favicon wiring is now aligned to the active FindMeHere surface entry point and resolves through `/favicon.ico`.
- The oversized page/hero title treatment was reduced substantially during the redesign pass, then tightened again in a later refinement pass so the landing surface feels less oversized and more premium.
- Current hero/headline copy aligns to the updated direction: `Find your favourite creators live right now.`

### Theme / Shell Polish

- Theme-reactive title/heading color handling was corrected so primary FindMeHere typography swaps cleanly between dark and light themes.
- The footer/page shell was tightened so the footer sits flush to the bottom of the viewport/page flow instead of visually floating above it.
- The earlier text-labeled theme switcher was replaced with an icon-only accessible sun/moon toggle while preserving keyboard access, persistence, and clear state indication.

### Human-Readable Impact

- FindMeHere now reads as a first-class public destination in the platform rather than a temporary members-side surface, with a more premium branded presentation and a complete dual-theme system.
- The work in this repo for this milestone was iterative and cumulative: brand direction, surface density, copy, theme parity, and shell polish were layered in across multiple passes to arrive at the current `findmehere.live` presentation.
