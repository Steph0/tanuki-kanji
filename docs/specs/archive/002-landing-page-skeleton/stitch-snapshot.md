# Stitch snapshot — Landing page skeleton (vendor-independent backup, add-only)

> Archive note: `002-landing-page-skeleton.md` is frozen history and is NOT
> modified by this file. This snapshot is a later add-on so future readers can
> understand what Stitch provided without Stitch access. Where this snapshot and
> the archived spec disagree, the archived spec's shipped code
> (`src/components/Navbar/`, `src/pages/LandingPage/`) is truth.

This file + `stitch-home-mobile.html` + `stitch-home-desktop.html` + the two
`stitch-home-*-shot.jpg` files are the self-contained backup of the Stitch
design behind spec 002. The Stitch project ID below is provenance only, never a
build input.

## Provenance

- Stitch project: "Tanuki Kanji - homepage", ID `9961209527127701541`
  (`PRIVATE`, `TEXT_TO_UI_PRO`, exported 2026-10-08).
- Mobile screen: "Tanuki Sensei - Home & Kanji Search",
  screen ID `2e1f6a0638954321b03ede2555ed04a2`, `MOBILE`, 780×2052, vendored as
  `./stitch-home-mobile.html` (+ `./stitch-home-mobile-shot.jpg`).
- Desktop screen: "Tanuki Sensei - Home & Kanji Search (Desktop)",
  screen ID `8a3d4a15456645d190bd40e8c4ead296`, `DESKTOP`, 2560×3012, vendored
  as `./stitch-home-desktop.html` (+ `./stitch-home-desktop-shot.jpg`).
- Raw exports are verbatim, including Tailwind CDN + Google Fonts links, which
  are Stitch scaffolding and are FORBIDDEN in our build — see Divergences.
- Live Stitch image URLs expire; runtime uses local `src/assets/navbar/` +
  `src/assets/banner/` files (sourced from `./app_logo.png` and
  `./landing_page_banner.png`), never hotlinks Stitch.

## Copy deck (verbatim from Stitch)

- Brand: "Tanuki Sensei" (later renamed "Tanuki Kanji" in code; code wins).
- Logo alt: "Tanuki Sensei Logo". Banner alt: "Tanuki Sensei kanji illustration".
- Banner badge: "Unlock the secrets behind every stroke" (icon `auto_stories`).
- Mission: "Tanuki Kanji guides you to understand Kanji real meaning. No funny
  memorization tricks, real history.<br>Ready to learn?"
- Search label: "Enter your kanji" (icon `ink_highlighter`); counter starts at
  "0 / 21 chars" (mobile export says "0 / 21 chars" in label but its script
  counts `/ 8 chars` with `maxlength="8"`; desktop export uses 21 consistently).
- Input `aria-label`: "Rechercher un kanji ou un mot" (French — Stitch
  artifact, NOT shipped; code uses "Enter your kanji"); placeholder:
  "e.g. 森 or 食べる".
- Buttons: `aria-label="Clear field"` (glyph `cancel`), `aria-label="Submit
  search"` (arrow glyph).
- Header right control: `aria-label="Rafraîchir l'application"` (French —
  Stitch artifact, NOT shipped) with `title` of the same text and inline SVG
  refresh arrows; `onclick="window.location.reload()"`.
- Explanation card: heading "Why Etymology Works", tag "Natural Memory"
  (uppercase), items "Logical Radical Blocks" ("Stop treating complex
  characters like abstract lines. Each stroke is a meaningful story
  component.", icon `lightbulb`) and "Deep Cultural Folklore" ("Tanuki Sensei
  weaves historical tales, seasonal poems, and native idiom trivia into your
  daily review.", mobile icon `temp_preferences_custom`, desktop
  `temp_preferences_eco` per shipped code).
- Stitch demo script (NOT shipped): 6-entry `KANJI_DATA` preview
  (木/森/語/桜/魂/探 with meanings + readings) and empty-submit fallback
  filling "森". Our validation lives in `src/services/validate.ts` instead.

## Layout: mobile → desktop deltas (from raw exports)

| Component   | Mobile (`stitch-home-mobile.html`)            | Desktop (`stitch-home-desktop.html`)              |
| ----------- | --------------------------------------------- | ------------------------------------------------- |
| Shell       | `mobile_tab`, single column, `px-margin`      | `web_standard`, `md:max-w-[1120px]` centered      |
| Banner      | fluid `aspect-[16/9]` cover crop              | centered strip, `max-h-[220px]`, `contain`, hover zoom |
| Caption     | overlay `span` on gradient                    | overlay `p` on gradient                           |
| Search card | `maxlength="8"`, counter `/ 8 chars`         | `maxlength="21"`, counter `/ 21 chars`            |
| Explanation | stacked rows                                  | `grid md:grid-cols-2` side-by-side                |
| Header      | fixed `h-16`, logo 36px circle + title        | same, `md:max-w-[1120px]`                         |

Tablet has no Stitch source (per archived spec): mobile stacking +
`DESIGN.md` tablet rules apply.

## Token map (Stitch → DESIGN.md)

Canvas/surface/border/ink tones match `DESIGN.md`. Deltas: Stitch primary
`#002b1a`→`#14422d` scale vs `DESIGN.md` primary `#2d5a43`; Stitch labels use
`Space Grotesk` vs `DESIGN.md` `Plus Jakarta Sans` for labels; Stitch body
text `#334155` in places vs `DESIGN.md` ink-soft/muted discipline; Stitch
`headline-xl` 36/44 vs project `DESIGN.md` 20/28 cap. `DESIGN.md` wins every
conflict — it already did during implementation (e.g. real `SearchBar` focus
ring, `.field` wrapper, `Banner` `contain` 220px strip).

## Divergences (do NOT port)

- Tailwind CDN script, Google Fonts `<link>`s, `lh3.googleusercontent.com`
  hotlinks → forbidden; project uses CSS Modules + `var(--...)`,
  `@fontsource` imports, local assets.
- `maximum-scale=1.0, user-scalable=no`, hidden scrollbars,
  `min-height: max(884px, 100dvh)` → forbidden (zoom/a11y).
- French `aria-label`/`title` strings, `window.location.reload()` refresh
  semantics, `KANJI_DATA` demo preview, "Tanuki Sensei" brand → superseded by
  shipped code (English labels, router navigation, real validation, "Tanuki
  Kanji" brand).
- Mobile/desktop `maxlength` + counter mismatch (8 vs 21) → resolved in code
  by `src/services/validate.ts` + `useKanjiInputValidation.ts`.
