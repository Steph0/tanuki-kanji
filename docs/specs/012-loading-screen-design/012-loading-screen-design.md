# 012 — Loading screen design

# Why

Current loading page is a shell without any design. We want to make it look nice.

# What

- While their lesson loads, the user sees a calm illustration with a short rotating lore line underneath, instead of a bare "Loading..." shell.
- On any screen size the loading content looks centered with no page scrollbar; on very short screens the illustration crops rather than forcing scroll.
- The navbar gains a way back: its right control returns the user to the homepage, announced as "Back to homepage".
- What does NOT change in this spec: lesson generation itself, search input and validation, result page, brand logo and title.

# Constraints

- Standing rules apply: `DESIGN.md` is the sole styling truth and wins over any Stitch output; `AGENTS.md` workflow, testing and memory conventions apply.
- Granted bypass for this spec only: Stitch MCP may be consulted as an inspiration source. The vendored `./stitch-snapshot.md` (+ raw `./stitch-loading-screen.html`) is the normative design record. Output must be re-implemented with the project stack and tokens — no Stitch-emitted dependencies, CDN, `<link>`, or fonts.
- No new `package.json` dependencies. Icons must come from the already-installed Material Symbols package.

# Tasks

- [x] Task 1 — Calm mobile loading moment
  - [x] The user gets a finished-looking loading view on phones first: show the loading illustration with one short lore caption under it, keeping the existing polite loading announcement.
  - [x] Technical translation: re-implement the "Loading screen" from the vendored backup `./stitch-snapshot.md` + `./stitch-loading-screen.html` (Stitch MCP project ID `17727976435008157775` is provenance only, mobile base only) in `src/pages/LoadingPage/LoadingPage.tsx` 
        New `src/pages/LoadingPage/LoadingPage.module.css` (CSS Modules, consume tokens via `var(--...)`, no hardcoded colors/fonts/spacing/radii).
        Copy `docs/specs/012-loading-screen-design/stitch-tanuki-artwork.jpg` to `src/assets/loading/stitch-tanuki-artwork.jpg` (single variant in this task; spec-folder original stays as vendor backup). Render via `<picture>` + `<img>` with `alt="Tanuki calligraphing by lamplight while your lesson loads"`, explicit `width`/`height`, `decoding="async"`.
        Keep the live region (`aria-live="polite"`, `aria-busy="true"` on the status container) and keep `useLoadingPage.ts` engine behavior untouched. Navbar stays byte-identical in this task.
  - [x] Caption seed for this task only: 3 final-tone lines `"Tracing the roots of your kanji…"`. The full set comes in Task 3.
  - [x] Tests with the code: extend `src/pages/LoadingPage/LoadingPage.test.tsx`: illustration visible by `getByRole("img")`, 
        caption visible by `getByRole("status")`, live-region attributes asserted.
  - [x] Gate: `npm run build` + `npm run lint` + `npm run format` + `npm run test -- LoadingPage`.

- [ ] Task 2 — Illustration that fits every screen
  - [ ] The user sees the same centered loading view on phones, rotated screens and desktop, with no page scrollbar and no sideways drift.
  - [ ] Technical translation: add responsive variants following the `Banner.tsx` precedent — `src/assets/loading/stitch-tanuki-artwork-400.png`, `stitch-tanuki-artwork-400.webp`, `stitch-tanuki-artwork-800.png`, `stitch-tanuki-artwork-800.webp` — wired as `<source type="image/webp" srcSet="... 400w, ... 800w">` + `<img srcSet="... 400w, ... 800w" sizes="(max-width: 48rem) calc(100vw - 2rem), 400px">`, keeping explicit `width`/`height` + `decoding="async"`. Then rename assets to `loading_page-xxx;<extension>` so that the asses names refers to the Loading Page.
        Mobile-first base styles; desktop variation in `@media (min-width: 48rem)`; short-viewport override in `@media (max-height: 37.5rem)` declared after the desktop block per `DESIGN.md` (restores cover crop, loosens vertical centering).
        Center the page shell horizontally and vertically without page scroll at `390x844`, `844x390`, `1280x800`; never use `overflow: hidden` to trap zoomed content.
  - [ ] Tests with the code: extend `LoadingPage.test.tsx` with `srcset`/`sizes` string assertions mirroring `Navbar.test.tsx` logo assertions (`src` contains `stitch-tanuki-artwork-400.png`, webp `source` `type="image/webp"`). No new `getComputedStyle` guards.
  - [ ] Gate: `npm run build` + `npm run lint` + `npm run format` + `npm run test -- LoadingPage`.

- [ ] Task 3 — Captions that rotate gently
  - [ ] While waiting, the user reads a short kanji-lore line that changes every second or two, feeling organic rather than metronomic; users who ask for reduced motion see a single static line.
  - [ ] Technical translation: new `src/pages/LoadingPage/loadingCaptions.ts` exporting `LOADING_CAPTIONS: string[]` (exactly 20 entries, `body-sm`-length, folklore/etymology tone like `Banner`/`Explanation`, e.g. `"Tracing the roots of your kanji…"`, `"Every stroke was once a picture."`, `"Tea cools, ink dries, meaning stays."`, `"The tanuki grinds fresh ink for you."`) plus `LOADING_CAPTION_MIN_MS = 900` and `LOADING_CAPTION_MAX_MS = 2000`.
        New `src/pages/LoadingPage/useRotatingCaption.ts` exporting `useRotatingCaption(captions, minMs, maxMs, randomSource = Math.random)` returning the current index; delay per tick is `minMs + randomSource() * (maxMs - minMs)`.
        Honor `prefers-reduced-motion` by rendering the first caption statically (no timer).
        Caption container keeps `role="status"` + polite live region; Japanese spans carry `lang="ja"`.
  - [ ] Tests with the code: unit `src/pages/LoadingPage/useRotatingCaption.test.ts` (fake timers, injected `randomSource`: advances within 900–2000ms bounds, non-constant delays across ticks); integration in `LoadingPage.test.tsx` (caption rotates to a second entry; static first caption with reduced motion emulated). Existing `useLoadingPage.test.tsx` stays green untouched.
  - [ ] Gate: `npm run build` + `npm run lint` + `npm run format` + `npm run test -- LoadingPage`.

- [ ] Task 4 — Navbar button back to the homepage
  - [ ] The user can leave the loading view and return to the search homepage from the navbar.
  - [ ] Technical translation: in `src/components/Navbar/Navbar.tsx`, replace the non-interactive `span.homeMark` (`aria-hidden`, `sync.svg`) with a real `<button type="button">` reusing the existing `.homeMark` 44×44 target, labeled `aria-label="Back to homepage"` with a visible tooltip reading `"Back to homepage"` on both `:hover` and `:focus-visible` (never hover-only).
        Icon is an already-installed `@material-symbols/svg-400/outlined` back glyph (e.g. `arrow_back.svg`), sized via `ICON_MD_PX` + `width`/`height` attrs like today.
        Click routes home via `preact-iso` `useLocation().route("/")` (same pattern as `AppRouter.tsx` `handleSubmit`).
        Keyboard focus shows the `DESIGN.md` 2px `primary` outline with 2px offset.
  - [ ] Tests with the code: extend `src/components/Navbar/Navbar.test.tsx` (one `render` per test, `getByRole` priority): button `getByRole("button", { name: "Back to homepage" })` is visible, activates home navigation, tooltip text appears on hover and on focus. Axe stays at App level only.
  - [ ] Gate: `npm run build` + `npm run lint` + `npm run format` + `npm run test -- Navbar`, then full `npm run test`.

# Acceptance

- When the user submits a kanji → the loading view shows the illustration, one lore caption, and the navbar unchanged (Task 1).
- When the viewport is `390x844`, `844x390`, or `1280x800` → the loading content reads centered with no page scrollbar (Task 2).
- When the user waits: the caption changes within ~1–2s per rotation, non-uniformly; with reduced motion → the caption stays static (Task 3).
- When the user activates the navbar right control: they return to `/` and assistive tech announces "Back to homepage" (Task 4).
- Final full loop passes: `npm run build` + `npm run lint` + `npm run format` + `npm run test`; App axe checks stay clean at mobile, rotated, and desktop viewports.
