# Bump Notes

## RELEASED / PACKAGED: 0.4.2-alpha

Packaged / released and no longer the active pending bucket. Preserve new notes for the open `0.4.8-alpha` section below.

## FindMeHere Admin Badge Priority Alignment - 2026-03-27

- Members and FindMeHere fallback badge builders now stop emitting creator-tier icons for admin accounts, and the shared badge normalizers also strip stale admin-plus-tier combinations when older payloads still carry them.
- This keeps FindMeHere within the existing allowed badge subset while ensuring admin accounts show the Admin badge rather than a redundant creator-tier badge, without reintroducing moderator or developer badges on that share-first surface.

### Files / Areas Touched

- `js/members-ui.js`
- `js/members-data.js`
- `js/members-session.js`
- `assets/js/ss-profile-hovercard.js`
- `BUMP_NOTES.md`

## FindMeHere Badge Subset Alignment - 2026-03-26

- Members and FindMeHere profile normalization now prefer the backend-authored `findmehere_badges` subset, with fallback only when older payloads still carry legacy badge shapes.
- Members hovercards, shared badge render helpers, authenticated session normalization, and FindMeHere page rendering now resolve the authoritative badge keys against the local icon assets, while keeping moderator and developer badges out of the FindMeHere display path when the backend omits them.
- This keeps FindMeHere and Members as contract consumers only and aligns the share-first surface to the runtime-owned badge visibility policy instead of local role/tier badge logic.

### Files / Areas Touched

- `js/members-ui.js`
- `js/members-data.js`
- `js/members-session.js`
- `js/findmehere-app.js`
- `assets/js/ss-profile-hovercard.js`
- `BUMP_NOTES.md`

## FindMeHere Background Visibility + Custom Links Render - 2026-03-26

- The live FindMeHere profile shell now applies saved public-profile background images in a visibly effective way by strengthening the route background layer and tuning panel translucency, fixing the real-world issue where customized backgrounds were technically present but visually lost behind mostly opaque content blocks.
- FindMeHere profile pages now render creator-configured custom links inside the existing action/link area using either the saved per-link icon or the shared portal fallback icon, while keeping the existing primary CTA treatment and empty-state behavior intact when no extra links are present.
- The public profile normalization/search path now carries those custom links through hydration so the live surface, page rendering, and related client-side profile handling all stay aligned to the same authoritative contract.

### Files / Areas Touched

- `js/findmehere-app.js`
- `css/findmehere.css`
- `BUMP_NOTES.md`

## Cross-Repo README Architecture Alignment - 2026-03-21

- The FindMeHere README now includes a repo-scoped Mermaid flowchart, aligned wording around directory-first routing and runtime/Auth authority, refreshed cross-repo references, and a normalized tree using current branch characters.
- The doc wording now keeps FindMeHere clearly positioned as the active share-first surface that consumes canonical slug, eligibility, and live-status truth rather than owning it.
- This was a documentation-only pass. No FindMeHere routing, hydration, analytics, or live-view behavior changed in this note.

### Files / Areas Touched

- `README.md`
- `BUMP_NOTES.md`

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

## CURRENT VER= 0.4.2-alpha / PENDING VER= 0.4.8-alpha

Open bucket for future work only. Do not add new `0.4.8-alpha` prep notes into the released `0.4.2-alpha` section above.

### FindMeHere Authoritative Live Status Downstream Pass - 2026-04-13

### Technical Notes

- Centralized the repo’s downstream live-state interpretation in `js/members-data.js` so FindMeHere now prefers `/shared/state/live_status.json`, keeps `data/live-status.json` only as a fallback mirror, and uses the same aggregate-live plus optional-Rumble-enrichment rules as the public site.
- Added the small Rumble discovery adapter in `js/members-data.js` for `/shared/state/rumble_live_discovery.json`, but kept it strictly additive: it only fills missing watch URL, title, and viewer-count metadata for already-live aggregate entries and never overrides offline/stale aggregate truth.
- Updated `index.html` to load `js/members-data.js` on the active FindMeHere SPA shell and changed `js/findmehere-app.js` to consume the shared loader/merge helpers so directory cards, `/live`, and root-slug profile pages all follow the same runtime-owned interpretation path.
- Replaced the old “embedded live payload wins unconditionally” behavior on fetched public profiles with merge behavior, so sparse embedded profile live data can inherit richer runtime-export metadata instead of dropping the live destination link.
- Added focused regression coverage in `tests/live-status-authority.test.mjs` for Rumble enrichment, merge behavior, shared-state fallback, and the shell wiring that now loads the shared members-data helper before the FindMeHere app.
- No files were removed in this repo during this pass. The checked-in `data/live-status.json` mirror remains as the static fallback, but it is no longer treated as the main live-data source.

### Human-Readable Notes

- FindMeHere profile pages, directory cards, and `/live` now consume the real runtime live export path first and stay aligned with the public site’s live/offline rules.
- When the runtime already exposes a Rumble watch destination through discovery, FindMeHere now surfaces that link on existing live UI instead of leaving creators marked live without a usable watch target.

### Files / Areas Touched

- `index.html`
- `js/members-data.js`
- `js/findmehere-app.js`
- `tests/live-status-authority.test.mjs`
- `README.md`
- `BUMP_NOTES.md`

### Technical Notes

- `js/findmehere-app.js` now builds the FindMeHere shell with page context, allowing the shared header to keep the default FindMeHere mark on directory/live surfaces while supporting profile-only creator branding overrides from future public-theme data when a header logo or brand text is present.
- The old directory top hero/stat-card composition was replaced by a full-width creator slideshow that prioritizes currently live eligible creators first and then falls back to the existing deterministic profile sort for the rest of the roster.
- The directory framing moved into a slimmer discovery strip below the slideshow, while the search bar, A-Z filtering, and gallery/list toggles remain in place under the new hierarchy.
- Public profile normalization now carries additive render hooks for header branding, accent color, button tone/color, font preset, layout preset, and image visibility toggles, all defaulting safely so existing public profiles render essentially unchanged when no theme data exists.
- Profile pages now include a scoped advanced custom CSS foundation that only accepts approved local selectors and a small allowlist of presentational properties; global selectors, at-rules, and clearly unsafe constructs are rejected.
- `css/findmehere.css` gained the render-layer support needed for the new header layout, slideshow/discovery composition, responsive profile presets, and profile-only theme variable overrides.

### Human-Readable Notes

- FindMeHere’s public directory now opens with a creator-led slideshow instead of the older bulky split hero, so the surface feels more like a premium discovery entrance and less like a stats dashboard.
- The shared header is tighter and cleaner, with Live now promoted as the primary call to action, StreamSuites condensed into an icon button, and the Login control now showing either the fallback profile icon or the signed-in avatar.
- Creator share pages are now ready for future branding and layout personalization without requiring this task to build the creator-side editor first.

### Files / Areas Touched

- `js/findmehere-app.js`
- `css/findmehere.css`
- `BUMP_NOTES.md`

### Risks / Follow-Ups

- The advanced custom CSS hook is intentionally conservative for this pass: it only supports approved local selector aliases and a small set of visual properties, so broader creator-controlled styling will require a larger sanitizer/authoring design later.
- The slideshow currently uses front-end rotation with unobtrusive autoplay plus manual controls; browser-level motion or performance tuning may still be worth checking on lower-powered devices after live QA.

### Header + Hero Refinement Fix Pass - 2026-03-24

#### Technical Notes

- `js/findmehere-app.js` now keeps the directory header action order locked as StreamSuites icon, Login, theme toggle, and the primary `Live now` CTA on the far right, instead of allowing the red CTA to render first in the action cluster.
- The StreamSuites icon-only control and logged-out Login fallback icon now render as inline `currentColor` SVGs rather than plain SVG images, so the control icons follow the same foreground color as their buttons across dark/light theme and hover/focus state changes while preserving avatar-image swapping for signed-in users.
- The directory landing composition was reordered so the intro/title block renders first, the slideshow follows immediately after it, and the search/view/A-Z discovery controls stay below the slideshow with existing filtering and view-toggle behavior intact.
- The slideshow markup now uses a tighter featured-panel rail for tags and CTAs, while `css/findmehere.css` tightens spacing, content box sizing, and responsive alignment so the slide layout feels less loose on wide desktop widths without changing roster sourcing or live-first ordering logic.
- Mobile header styling was tightened further so the topbar cluster compresses more predictably on narrow widths while retaining the same control order and keeping the `Live now` CTA visually primary.

#### Human-Readable Notes

- FindMeHere now reads in the intended order: header first, intro second, featured creator carousel third, and the actual discovery/search controls after that instead of having the slideshow compete with the directory heading.
- The header controls now feel more deliberate, with the red `Live now` action consistently anchored as the primary far-right CTA and the non-primary icons finally matching their button color in both themes.
- The featured creator slideshow keeps the same direction but feels more composed, denser, and more curated rather than like a wide loose banner with extra dead space.

#### Files / Areas Touched

- `js/findmehere-app.js`
- `css/findmehere.css`
- `BUMP_NOTES.md`

#### Risks / Follow-Ups

- A very narrow mobile width still warrants live-device QA because the header now uses a more constrained fallback layout there; the required order and CTA priority are preserved, but small-browser chrome differences should still be checked in-device.
- The icon-color fix is now robust for the two affected header controls because it uses inline SVGs, but any future shared-button icon work should follow the same pattern instead of reintroducing image-based SVG coloring.

### Task 3P - Developer Tier + Badge Surface Matrix - 2026-03-28

#### Technical Notes

- Members-side badge consumers now stop suppressing backend badge combinations locally and prefer the backend profile-card/directory projections where available.
- Hovercard badge fallback logic now accepts the stored `developer` tier cleanly instead of collapsing it back to Core when a fallback tier badge must be inferred.

#### Human-Readable Notes

- Directory cards and hovercards now align more closely with the backend badge visibility rules instead of second-guessing them in the client.

#### Files / Areas Touched

- `js/members-ui.js`
- `assets/js/ss-profile-hovercard.js`

#### Risks / Follow-Ups

- Any remaining member-surface badge renderer that still falls back to local assumptions should be moved onto the backend surface payload in the same way before treating the migration as complete.
