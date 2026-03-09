# StreamSuites-Members

Standalone FindMeHere surface targeted for `https://findmehere.live`.

- Production target: `https://findmehere.live`
- Local root path: `C:\NEPTUNE LOCAL\GIT\StreamSuites-Members`
- Current phase: this repo is being repurposed from the earlier members experiment into the standalone FindMeHere share and directory surface

## Current State

This repository now serves as the dedicated FindMeHere public surface instead of a `members.streamsuites.app` clone.

- `/` is the directory-first landing page
- `/<slug>` is the canonical public FindMeHere profile route
- Cloudflare Pages deep links are handled through a single-entry fallback in [`_redirects`](C:\NEPTUNE LOCAL\GIT\StreamSuites-Members\_redirects)
- authoritative public profile hydration now runs through the same-origin Pages proxy at [`functions/api/public/profile.js`](C:\NEPTUNE LOCAL\GIT\StreamSuites-Members\functions\api\public\profile.js) to avoid browser CORS failures against the StreamSuites API
- directory hydration now starts from the local snapshot of the authoritative StreamSuites export in [`data/findmehere-directory.json`](C:\NEPTUNE LOCAL\GIT\StreamSuites-Members\data\findmehere-directory.json)
- directory eligibility uses canonical exported slug plus FindMeHere surface fields, while per-profile rendering is still verified against the authoritative StreamSuites public profile payload at runtime
- the active FindMeHere directory surface supports search, A-Z filtering, and gallery/list display modes over the hydrated eligible profile set
- standalone profile routes prominently share only the FindMeHere URL, with StreamSuites full-profile links presented as a secondary outbound action when available
- signup, login, and profile-management calls-to-action route back toward StreamSuites

## Notes

- Legacy members-era routes and files remain in the repo for now, but the active FindMeHere entry point is [`index.html`](C:\NEPTUNE LOCAL\GIT\StreamSuites-Members\index.html).
- The new surface intentionally focuses on FindMeHere share URLs only. StreamSuites profile URLs are secondary outbound links when the authoritative payload provides them.

## Repo Tree

```text
StreamSuites-Members/
|-- README.md
|-- _redirects
|-- favicon.ico
|-- functions/
|   `-- api/
|       `-- public/
|           `-- profile.js
|-- index.html
|-- assets/
|   |-- css/
|   |   `-- ss-profile-hovercard.css
|   |-- icons/
|   |   |-- discord.svg
|   |   |-- github.svg
|   |   |-- google.svg
|   |   |-- kick.svg
|   |   |-- pilled.svg
|   |   |-- rumble.svg
|   |   |-- tierbadge-admin.svg
|   |   |-- tierbadge-core.svg
|   |   |-- tierbadge-gold.svg
|   |   |-- tierbadge-pro.svg
|   |   |-- twitch.svg
|   |   |-- twitter.svg
|   |   |-- x.svg
|   |   `-- youtube.svg
|   |-- icons/ui/
|   |   |-- cards.svg
|   |   |-- cog.svg
|   |   |-- dashboard.svg
|   |   |-- globe.svg
|   |   |-- heart.svg
|   |   |-- identity.svg
|   |   |-- minus.svg
|   |   |-- plus.svg
|   |   |-- portal.svg
|   |   |-- profile.svg
|   |   |-- querystats.svg
|   |   |-- send.svg
|   |   |-- sidebar.svg
|   |   |-- tablechart.svg
|   |   |-- tickbadge.svg
|   |   |-- tickyes.svg
|   |   `-- widget.svg
|   |-- js/
|   |   `-- ss-profile-hovercard.js
|   |-- logos/
|   |   |-- logo.png
|   |   `-- logocircle.png
|   `-- placeholders/
|       `-- defaultprofilecover.webp
|-- auth-complete/
|   `-- index.html
|-- css/
|   |-- findmehere.css
|   |-- members.css
|   |-- public-shell.css
|   `-- theme-dark.css
|-- data/
|   |-- findmehere-directory.json
|   |-- notices.json
|   `-- profiles.json
|-- js/
|   |-- findmehere-app.js
|   |-- members-app.js
|   |-- members-auth-complete.js
|   |-- members-data.js
|   |-- members-session.js
|   |-- members-shell.js
|   |-- members-ui.js
|   `-- profile-app.js
|-- members/
|   `-- index.html
|-- notices/
|   `-- index.html
|-- settings/
|   `-- index.html
`-- u/
    `-- index.html
```
