# Why

No landing page exists, so first-time visitors have no entry point to discover Kanji search.

# What

Bootstrap the landing page skeleton with static navbar, banner, search bar, and explanation block.

# Constraints

- Static images in `src/assets/<component>/` with per-component subfolders; agents must copy source pngs there, never reference `docs/` at runtime
- Do not add new `package.json` dependencies beyond the already-installed fonts and icons, and no external third party in `<header>`
- Fonts: use only the installed `@fontsource/epilogue`, `@fontsource/plus-jakarta-sans`, `@fontsource/noto-sans-jp` packages with static imports (no CDN `<link>`); weights: Epilogue 600+700, Plus Jakarta Sans 400+600+700, Noto Sans JP 400 (fallback for kanji/JP text per DESIGN.md typography stacks)
- Use `material-symbols` for all the icons via the already-provided `@material-symbols/svg-400` npm package only, no CDN `<link>`
- Use DESIGN.md instructions, never modify the `DESIGN.md` file
- Use CSS modules with native CSS variables
- Separate global style (webapp wide in `src/index.css`) from component specific style (`src/components/*/*.module.css`)

# Tasks

Use Stitch MCP to create the "Tanuki Sensei - Home & Kanji Search (Mobile)" page. Stitch MCP output is the source of truth for layout and copy in 002. This landing page will replace the actual `App` component that `main.tsx` is calling.

- [X] Start with the skeleton, nothing in the body first, just the background, grid, margins
  - [X] DESIGN.md tokens only: mobile 4-col / 1rem margin, tablet 8-col / 2rem margin, desktop 12-col max 1120px centered / 3rem margin, washi canvas background
  - [X] Load fonts globally in `src/index.css` via `@fontsource` imports and define `font-family` stacks per DESIGN.md (Epilogue headings, Plus Jakarta Sans + Noto Sans JP body/labels, Noto Sans JP kanji display)
  - [X] Ensure separating the CSS depending on the viewport, in order it must be mobile-first, then tablet, then desktop
- [X] Create navigation bar component (purely static version)
  - [X] Navigation is always visible at the top of the viewport and not affected by scrolling (sticky `top: 0`).
  - [X] Left: app logo image + title, static, no link. Use [app_logo.png](./app_logo.png) copied to `src/assets/navbar/` for the logo
  - [X] Right: arrows symbol static, no `<a>`, no JS; future home link, explicitly non-interactive in 002
- [X] Create a banner component with the banner and the text block under the banner
  - [X] Use [landing_page_banner.png](./landing_page_banner.png) copied to `src/assets/banner/` for the banner, with descriptive `alt`
  - [X] Headline, subtext, search placeholder, button `aria-label` same as provided by Stitch MCP; use semantic `header` / `nav` / `main` and a real `<label>` for the search input
- [X] Create a search bar component
  - [X] Do not add any interactivity or validation on the input or send button
- [X] Create the explanation component with all the explanations that are under the search bar component in the Stitch design

# Acceptance

- Sticky nav, banner `alt`, labeled static search input + button, correct at mobile / tablet / desktop per DESIGN.md
- `biome check` and `vite build` pass