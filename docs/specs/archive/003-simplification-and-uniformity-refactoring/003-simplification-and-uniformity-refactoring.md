# Why

We have a strong static landing page skeleton that works. But code and design documentation lacks uniformity and can be simplified.

# What

Remove "noise" like excessive comments and non-meaningful appelation in codebase.
Create CSS tokens for "magic numbers".
Promote also higher CSS rules when possible.
Promote clear separation between semantic and styling.

# Constraints

- Follow `AGENTS.md` and `DESIGN.md` rules at all times

# Tasks

- [x] Task 1 — Rename `src/index.css` to `src/globals.css`
  - [x] `git mv src/index.css src/globals.css` (content unchanged).
  - [x] `src/main.tsx`: change `import "./index.css"` to `import "./globals.css"`.
  - [x] `index.html`: untouched (entry stays `src/main.tsx`; no `<link>`).
  - [x] `src/globals.css` keeps Fontsource `@import`s at top (must precede other rules).
  - [x] Gate — basic checks must pass before Task 2 (`npm run build` + `npm run lint` green)

- [x] Task 2 — Rename `src/app.tsx` / `src/app.css` to PascalCase + CSS Module
  - [x] `git mv src/app.tsx src/App.tsx`.
  - [x] `git mv src/app.css src/App.module.css`.
  - [x] `src/main.tsx`: change `import { App } from "./app.tsx"` to `from "./App.tsx"`.
  - [x] `src/App.tsx`: replace `import "./app.css"` with `import styles from "./App.module.css"`.
  - [x] Classes to camelCase: `app-container` -> `styles.appContainer`, `page-shell` -> `styles.pageContent`, `stack` -> `styles.stack`, `call-to-action` -> `styles.callToAction`.
  - [x] `src/App.module.css`: rename selectors to `.appContainer`, `.pageContent`, `.stack`, `.callToAction`
  - [x] Merge single-use `.stack` into `.pageContent`
  - [x] Move `pageContent` rules into module
  - [x] Rename `.pageShell` -> `.pageContent` (accepted two-job class: shell geometry + content column; bare `main` selector rejected — unscoped leak from CSS Module; split deferred until a second content page exists).
  - [x] Remove from `src/globals.css`: `.app-container`, `.page-shell`, all `@container app` blocks.
  - [x] Gate — basic checks pass (`npm run build` + `npm run lint` green)

- [x] Task 3 — Refactor navbar content
  - [x] `--navbar-h` single-owned by App: removed `4.5rem` from Navbar `.bar` AND from `.pageContent`, hoisted to `.appContainer` in the same `@container app (min-width: 48rem)` block.
  - [x] Stale comments fixed: Navbar sync comment (`index.css` / `.page-shell`) deleted with the duplicate; Banner + App comments now point at `.appContainer`.
  - [x] Rename `.inner` to `.navigationContent`
  - [x] Replace magic img numbers with file-local `LOGO_INTRINSIC_PX` / `HOME_ICON_INTRINSIC_PX` consts for intrinsic pre-CSS sizes

- [x] Task 4 — Refactor banner content
  - [x] `index.html`: add one-line `<meta name="description">` with text from current `srOnly` tag in `Banner.tsx`.
  - [x] Simplify heading: pitch `<p>` becomes the visible `<h1 id="banner-heading" className={styles.pitch}>` with unchanged text; delete sr-only `h1` + unused `.srOnly` block. `section` keeps `aria-labelledby="banner-heading"`.
  - [x] Rename `.lede` to `.pitch`
  - [x] Reviewing class names, `.visual` set: `.section` to `.banner`, `.frame` to `.visual`so as image + overlay = one visual unit, rename `.copy` to `.introText`.
  - [x] Intrinsic consts for both images: `BADGE_ICON_INTRINSIC_PX = 15` + `ILLUSTRATION_INTRINSIC_W = 1376` / `ILLUSTRATION_INTRINSIC_H = 768`.

- [x] Task 5 — Refactor SearchBar content
  - [x] Remove h2 `srOnly` heading + `aria-labelledby` + unused `.srOnly` block.
  - [x] Drop `aria-label` on input.
  - [x] Rename root `.section` to `.search`.
  - [x] Intrinsic consts for both images: `LABEL_INTRINSIC_PX = 16` + `SUBMIT_INTRINSIC_PX = 20`.
  - [x] Focus per DESIGN.md:222: `.fieldRow:focus-within` to white bg, Matcha border + `0 0 0 3px rgba(45, 90, 67, 0.12)` glow; suppress native outline on `.input` only (fieldRow ring becomes the indicator)

- [x] Task 6 — Refactor Explanation content (grilled 2026-09-26)
  - [x] Resize icons to align with SearchBar (INTENTIONAL parity break): head icon rendered `1rem`→`1.25rem`, attrs `16`→`20`; item icons rendered `1.125rem`→`1rem`, attrs `18`→`16` (×2).
  - [x] Rename root `.section` to `.explanation`.
  - [x] Promote icon sizes: `globals.css` gains `--icon-sm: 1rem` (16), `--icon-md: 1.25rem` (20), `--icon-xl: 2.25rem` (36); new shared `src/constants/globals.ts` (`ICON_SM_PX = 16`, `ICON_MD_PX = 20`, `ICON_XL_PX = 36`); migrate ALL components off file-local consts (Navbar `LOGO`/`HOME`, Banner `BADGE`, SearchBar `LABEL`/`SUBMIT`, Explanation new); Explanation icon rules consume the vars.
  - [x] Semantic refactoring: `.items` `div` to `ul`, `.item` `div` to `li`, keep `aria-labelledby` + `h2`/`h3`. Keep same visual parity, only semantic refactoring.
  - [x] `globals.css` `img` gains `height: auto`.

- [x] Task 7 — Declare icon tokens in `DESIGN.md`
  - [x] Frontmatter `components` gains `icon-sm` / `icon-md` / `icon-xl`, each with a `size` (`1rem` / `1.25rem` / `2.25rem`), mirroring `--icon-*` / `ICON_*_PX`.
  - [x] Prose `## Iconography` after `## Shapes`: 8px-unit stepping, full token chain, size to usage mapping, stick to tokens rule.

# Acceptance

- `npm run build` and `npm run lint` and `npm run format` pass.
- Visual parity on mobile / tablet / desktop / rotated-phone unless asked otherwise
- No `@container` left in `globals.css`; no hardcoded colors/spacing/fonts outside `var(--...)`; `DESIGN.md` only touched by Task 7 (icon tokens).
