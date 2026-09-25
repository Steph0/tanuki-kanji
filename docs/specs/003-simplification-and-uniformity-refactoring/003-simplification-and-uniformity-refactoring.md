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

- [X] Task 1 — Rename `src/index.css` to `src/globals.css`
  - [X] `git mv src/index.css src/globals.css` (content unchanged).
  - [X] `src/main.tsx`: change `import "./index.css"` to `import "./globals.css"`.
  - [X] `index.html`: untouched (entry stays `src/main.tsx`; no `<link>`).
  - [X] `src/globals.css` keeps Fontsource `@import`s at top (must precede other rules).
  - [X] Gate — basic checks must pass before Task 2 (`npm run build` + `npm run lint` green)

- [X] Task 2 — Rename `src/app.tsx` / `src/app.css` to PascalCase + CSS Module
  - [X] `git mv src/app.tsx src/App.tsx`.
  - [X] `git mv src/app.css src/App.module.css`.
  - [X] `src/main.tsx`: change `import { App } from "./app.tsx"` to `from "./App.tsx"`.
  - [X] `src/App.tsx`: replace `import "./app.css"` with `import styles from "./App.module.css"`.
  - [X] Classes to camelCase: `app-container` -> `styles.appContainer`, `page-shell` -> `styles.pageContent`, `stack` -> `styles.stack`, `call-to-action` -> `styles.callToAction`.
  - [X] `src/App.module.css`: rename selectors to `.appContainer`, `.pageContent`, `.stack`, `.callToAction`
  - [X] Merge single-use `.stack` into `.pageContent`
  - [X] Move `pageContent` rules into module
  - [X] Rename `.pageShell` -> `.pageContent` (accepted two-job class: shell geometry + content column; bare `main` selector rejected — unscoped leak from CSS Module; split deferred until a second content page exists).
  - [X] Remove from `src/globals.css`: `.app-container`, `.page-shell`, all `@container app` blocks.
  - [X] Gate — basic checks pass (`npm run build` + `npm run lint` green)

- [X] Task 3 — Refactor navbar content
  - [X] `--navbar-h` single-owned by App: removed `4.5rem` from Navbar `.bar` AND from `.pageContent`, hoisted to `.appContainer` in the same `@container app (min-width: 48rem)` block.
  - [X] Stale comments fixed: Navbar sync comment (`index.css` / `.page-shell`) deleted with the duplicate; Banner + App comments now point at `.appContainer`.
  - [X] Rename `.inner` to `.navigationContent`
  - [X] Replace magic img numbers with file-local `LOGO_INTRINSIC_PX` / `HOME_ICON_INTRINSIC_PX` consts for intrinsic pre-CSS sizes

- [X] Task 4 — Refactor banner content
  - [X] `index.html`: add one-line `<meta name="description">` with text from current `srOnly` tag in `Banner.tsx`.
  - [X] Simplify heading: pitch `<p>` becomes the visible `<h1 id="banner-heading" className={styles.pitch}>` with unchanged text; delete sr-only `h1` + unused `.srOnly` block. `section` keeps `aria-labelledby="banner-heading"`.
  - [X] Rename `.lede` to `.pitch`
  - [X] Reviewing class names, `.visual` set: `.section` to `.banner`, `.frame` to `.visual`so as image + overlay = one visual unit, rename `.copy` to `.introText`.
  - [X] Intrinsic consts for both images: `BADGE_ICON_INTRINSIC_PX = 15`  + `ILLUSTRATION_INTRINSIC_W = 1376` / `ILLUSTRATION_INTRINSIC_H = 768`.

- [X] Task 5 — Refactor SearchBar content
  - [X] Remove h2 `srOnly` heading + `aria-labelledby` + unused `.srOnly` block.
  - [X] Drop `aria-label` on input.
  - [X] Rename root `.section` to `.search`.
  - [X] Intrinsic consts for both images: `LABEL_INTRINSIC_PX = 16` + `SUBMIT_INTRINSIC_PX = 20`.
  - [X] Focus per DESIGN.md:222: `.fieldRow:focus-within` to white bg, Matcha border + `0 0 0 3px rgba(45, 90, 67, 0.12)` glow; suppress native outline on `.input` only (fieldRow ring becomes the indicator)



# Acceptance

- `npm run build` and `npm run lint` and `npm run format` pass.
- Visual parity on mobile / tablet / desktop / rotated-phone (container breakpoints + short-viewport centering unchanged).
- No `@container` left in `globals.css`; no hardcoded colors/spacing/fonts outside `var(--...)`; `DESIGN.md` untouched.
