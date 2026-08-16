# Handover: Krishnaprakash K — Portfolio Site

A finished, deployable static site. No build step, no dependencies, no framework.

## What to deploy

Upload these to the repo root (GitHub Pages, deploy from branch `main` / root):

```
index.html
styles.css
script.js
favicon.png
resume.pdf
projects/
  ripple/01.png … 28.png
  tinkerweb/01.jpg … 53.jpg
  playaround/01.jpg … 22.jpg
  a4alphabets/01.jpg … 20.jpg
.nojekyll
```

`.nojekyll` matters — without it Jekyll can interfere with the asset folders.

## Do NOT deploy

- `Portfolio.dc.html` — the original design prototype. Depends on a proprietary runtime; it is the design reference, not the site.
- `support.js` — that runtime.
- `content.md`, `design_handoff_portfolio/` — working notes and the original spec. The spec is marked superseded; treat `index.html` as the source of truth for copy, since some of it was edited after the rebuild.

The live site does not reference any of these.

## How it works

One scrolling page: header (sticky) → intro → Projects → About → Contact → footer.

Four project rows. Clicking a row (or focusing it and pressing Enter/Space) opens that project's case-study deck as a full-screen overlay. A Resume action opens `resume.pdf` in a similar overlay.

**State — three values, all in `script.js`:**
- `openProject` — index of the open project, `null` when closed
- `resumeOpen` — boolean
- `savedScrollY` — captured when an overlay opens, restored on close

No data fetching, no persistence, no routing.

**Overlays are built from `<template>` elements** in `index.html` (`#tpl-row`, `#tpl-project`, `#tpl-resume`) and mounted on demand, then removed on close. Copy lives in the templates and in the `PROJECTS` array — edit those, not the JS that assembles them.

**Project data** is the `PROJECTS` array at the top of `script.js`: slug, title, meta line, short summary (row), long summary (overlay), slide count, file extension, aspect ratio. Adding a project = one array entry plus a folder of slides.

**Per-project aspect ratios are deliberate.** The decks are not all 16:9 — Ripple is `3840/2160`, TinkerWeb `2800/2160`, the other two `16/9`. The ratio is set as a CSS variable on each slide wrapper so space is reserved before the image loads; without it the page height jumps while scrolling.

**Escape precedence:** resume overlay first (`z-index: 110`), then project overlay (`100`). Closing the resume must not release the scroll lock if a project overlay is still open underneath — `hideResume()` checks this.

## Design tokens

All in `:root` in `styles.css`. Primary blue `#0051FF`, ink `#0A0A0A`, body `#4A4E54`, meta `#666B71`, hairline `#E4E6E9`, surface `#F2F3F5`.

Type: Instrument Sans (headings, body) and IBM Plex Mono (labels, metadata), both from Google Fonts.

Two constraints worth keeping: **no border radius anywhere** — every corner is square on purpose. **No shadows** except the `inset 0 0 0 1px` hairline on row thumbnails, which gives white-ish covers an edge against the white page without shifting layout.

Fluid type and spacing use `clamp()` throughout, so there are no media queries except two small ones for the resume bar on narrow screens. Rows wrap to one column below roughly 700px.

Mono metadata is 12px and `#666B71` — don't go smaller or lighter, it fails WCAG AA at that size.

## Outstanding

**Optional, not built:** give each overlay a URL hash (`#ripple`, `#tinkerweb`, `#play-around`, `#a4alphabets`, `#resume`) so a case study can be linked directly and the browser back button closes it. Worth doing for a portfolio; skipped to keep the first version simple.

## Before going live

Check on a real phone: rows open, scroll position is restored on close, and the resume opens in a new tab (mobile browsers use the `<object>` fallback rather than embedding the PDF — keep that fallback).

Spelling: the word is **Resume** everywhere in the UI. No accented "Résumé".
