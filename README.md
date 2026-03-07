# StreamSuites-Members

Dedicated Cloudflare Pages-hosted member/community hub for StreamSuites.

- Production URL: `https://members.streamsuites.app`
- Local root path: `C:\NEPTUNE LOCAL\GIT\StreamSuites-Members`
- Current phase: second migration pass restoring baseline community hub parity from `StreamSuites-Public`

## Current State

This repo now carries the public community hub shell, top-bar account widget/dropdown behavior, session-aware rendering, hydrated profile/member data patterns, copied notice/profile seed data, and dedicated standalone `/u/<slug>` profile routing into the members-specific surface.

This pass intentionally does **not** add:

- live-status provider plumbing
- Cloudflare Functions
- new multi-platform live status providers

This phase specifically restores baseline parity features from the original public community hub, including:

- top bar user/account widgets
- account dropdowns and login/signup affordances
- public-session-aware shell behavior
- hydrated public profile loading for `/u/<slug>`
- members-side account settings and auth completion routes needed for the migrated session flow

## Repo Tree

```text
StreamSuites-Members/
|-- README.md
|-- _redirects
|-- favicon.ico
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
|   |-- members.css
|   |-- public-shell.css
|   `-- theme-dark.css
|-- data/
|   |-- notices.json
|   `-- profiles.json
|-- js/
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
