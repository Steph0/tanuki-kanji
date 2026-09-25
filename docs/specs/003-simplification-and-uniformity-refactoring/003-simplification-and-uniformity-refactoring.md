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

- [X] Task 3 — Refactor navbar CSS content
  - [X] `--navbar-h` single-owned by App: removed `4.5rem` from Navbar `.bar` AND from `.pageContent`, hoisted to `.appContainer` in the same `@container app (min-width: 48rem)` block. Not a pure delete — Navbar is a sibling of `main`, so neither old site inherited into the other subtree; `.appContainer` is their common ancestor (full-bleed, so the trigger point is unchanged).
  - [X] Stale comments fixed: Navbar sync comment (`index.css` / `.page-shell`) deleted with the duplicate; Banner + App comments now point at `.appContainer`.
  - [X] Rename `.inner` → `.navigationContent` (`Navbar.module.css` ×2, `Navbar.tsx`, `globals.css` token comment). Pure rename, computed CSS identical.
  - [X] Replace magic img numbers with file-local `LOGO_INTRINSIC_PX` / `HOME_ICON_INTRINSIC_PX` consts for intrinsic pre-CSS sizes

# Acceptance

- `npm run build` and `npm run lint` and `npm run format` pass.
- Visual parity on mobile / tablet / desktop / rotated-phone (container breakpoints + short-viewport centering unchanged).
- No `@container` left in `globals.css`; no hardcoded colors/spacing/fonts outside `var(--...)`; `DESIGN.md` untouched.
