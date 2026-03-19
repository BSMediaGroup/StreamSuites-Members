# Bump Notes

## CURRENT VER= 0.4.1-alpha / PENDING VER= 0.4.2-alpha

### Technical Notes

- This repo does not carry its own authoritative version file or runtime-export version mirror. The best grounded current-version value is therefore inferred from the adjacent StreamSuites runtime/export release train used by the surrounding surfaces, which is still `0.4.1-alpha`.
- `README.md` is already staged for `v0.4.2-alpha`, so version detection here is more ambiguous than in the other repos and should be treated as inferred rather than locally authored.
- Recent repo-visible work centered on the active FindMeHere shell in `js/findmehere-app.js`, with current code showing persisted light/dark theme handling, canonical root-slug routing, live-status hydration, and same-origin public profile fetching.
- Recent history also shows FindMeHere directory and session-related tightening in `index.html`, `js/findmehere-app.js`, and `js/members-session.js`, plus SEO/background asset refreshes that support the current public-facing presentation.

### Human-Readable Notes

- FindMeHere is being polished as a directory-first public surface with cleaner theme behavior, canonical slug routing, and live-status-aware profile presentation.
- The recent changes are mainly about correctness and surface polish rather than backend ownership changes; account and profile authority still live outside this repo.
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
