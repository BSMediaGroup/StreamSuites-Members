# StreamSuites-Members

Dedicated Cloudflare Pages-hosted member/community hub for StreamSuites.

- Production URL: `https://members.streamsuites.app`
- Local root path: `C:\NEPTUNE LOCAL\GIT\StreamSuites-Members`
- Current phase: first real migration pass of the existing community hub foundation from `StreamSuites-Public`

## Current State

This repo now carries the public community hub shell, styling language, discovery layout, copied notice/profile seed data, and dedicated standalone `/u/<slug>` profile routing into the members-specific surface.

This pass intentionally does **not** add:

- live API fetching
- live-status provider plumbing
- Cloudflare Functions
- authenticated settings/editor flows from the public site

## Repo Tree

```text
StreamSuites-Members/
|-- README.md
|-- _redirects
|-- favicon.ico
|-- index.html
|-- assets/
|   |-- icons/
|   |   |-- discord.svg
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
|   |   `-- tickyes.svg
|   |-- logos/
|   |   |-- logo.png
|   |   `-- logocircle.png
|   `-- placeholders/
|       `-- defaultprofilecover.webp
|-- css/
|   |-- members.css
|   |-- public-shell.css
|   `-- theme-dark.css
|-- data/
|   |-- notices.json
|   `-- profiles.json
|-- js/
|   |-- members-app.js
|   |-- members-data.js
|   |-- members-shell.js
|   |-- members-ui.js
|   `-- profile-app.js
|-- members/
|   `-- index.html
|-- notices/
|   `-- index.html
`-- u/
    `-- index.html
```
