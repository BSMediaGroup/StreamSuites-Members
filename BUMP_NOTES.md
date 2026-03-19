# Bump Notes

## CURRENT VER= 0.4.1-alpha / PENDING VER= 0.4.2-alpha

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
