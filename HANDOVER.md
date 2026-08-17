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
  ripple/01.webp … 28.webp
  tinkerweb/01.webp … 53.webp
  playaround/01.webp … 22.webp
  a4alphabets/01.webp … 20.webp
.nojekyll
```

`HANDOVER.md` itself is notes — harmless to deploy, but not needed.

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

**All slides are WebP** (`ext: 'webp'` on every project), numbered `01`–`NN` zero-padded to two digits. Slide 01 of each folder doubles as that project's row thumbnail. Quality 88 was chosen after comparing 80 vs 88 vs the original JPEG — 80 showed banding in the flat UI fills. If you re-export slides, keep the same names, the two-digit padding, and update `slides:` if the count changes.

**Per-project aspect ratios are deliberate.** The decks are not all 16:9 — Ripple is `3840/2160`, TinkerWeb `2800/2160`, the other two `16/9`. The ratio is set as a CSS variable on each slide wrapper so space is reserved before the image loads; without it the page height jumps while scrolling.

**Escape precedence:** resume overlay first (`z-index: 110`), then project overlay (`100`). Closing the resume must not release the scroll lock if a project overlay is still open underneath — `hideResume()` checks this.

**Back / swipe-back:** each overlay pushes a history entry **with a hash** (`#ripple`, `#tinkerweb`, `#playaround`, `#a4alphabets`, `#resume`), so case studies are directly linkable and the back button closes them. Loading the site with one of those hashes opens that overlay straight away. Close buttons route through `requestClose()` → `history.back()` so the stack never accumulates stale entries.

**The horizontal swipe is ours, not the browser's** (`attachSwipeBack()` in `script.js`). Browsers do not fire their own back gesture from inside a fixed, non-root scroll container, which is exactly what the project overlay is — so the trackpad swipe never reached history no matter what the CSS said. The handler reads horizontal `wheel` deltas (trackpad) and single-finger touch drags, slides the overlay right as you go, and closes past ~110px; anything vertical-dominant is ignored so normal scrolling is untouched. Related: `.ov-project` uses `overscroll-behavior-y: contain`, not the both-axes version, so nothing swallows horizontal intent.

## Design tokens

All in `:root` in `styles.css`. Primary blue `#0051FF`, ink `#0A0A0A`, body `#4A4E54`, meta `#666B71`, hairline `#E4E6E9`, surface `#F2F3F5`.

Type: Instrument Sans (headings, body) and IBM Plex Mono (labels, metadata), both from Google Fonts.

Two constraints worth keeping: **no border radius anywhere** — every corner is square on purpose. **No shadows** except the `inset 0 0 0 1px` hairline on row thumbnails, which gives white-ish covers an edge against the white page without shifting layout.

Fluid type and spacing use `clamp()` throughout, so there are no media queries except two small ones for the resume bar on narrow screens. Rows wrap to one column below roughly 700px.

Mono metadata is 12px and `#666B71` — don't go smaller or lighter, it fails WCAG AA at that size.

## Outstanding

Nothing known. Overlays are linkable by hash and close via back button, Escape, close button, or swipe.

## Before going live

Check on a real phone: rows open, scroll position is restored on close, and the resume opens in a new tab (mobile browsers use the `<object>` fallback rather than embedding the PDF — keep that fallback).

Spelling: the word is **Resume** everywhere in the UI. No accented "Résumé".

## Copy conventions

All project copy lives in the `PROJECTS` array in `script.js` — `short` shows on the row, `long` in the overlay. About/Contact copy lives directly in `index.html`.

House style, applied throughout: no em dashes (use a comma or a full stop), summaries kept to roughly 2–3 sentences, first sentence says what the thing is, then the problem, then what was built and with what. If you add a project, match that shape.
