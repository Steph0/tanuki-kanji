# Why

The landing page ships ~2.5MB of PNG on every load (`landing_page_banner.png` 1376px / 1.3MB, `app_logo.png` 1024px / 1.2MB). Mobile users pays desktop bytes. Mobile-first means the default download must be small, with larger variants only for larger/retina screens.

# What

- Phones download small images by default; sharper variants load only on bigger or high-density screens, with no visible quality loss.
- Old browsers still get a working image through a fallback.
- Page layout never jumps while images load; texts, crops, and breakpoints stay exactly as today.
- The banner is loading first, over its existing background.
- Browser tabs and iOS bookmarks show the logo on its beige square. No installable-app setup for now.

# Constraints

- Follow `AGENTS.md` and `DESIGN.md` at all times; never modify `DESIGN.md` in this spec.
- No new runtime dependencies, no CDN `<link>`, no external image service. Derivatives are generated once (e.g. `ffmpeg`/sharp locally) and checked into `src/assets/`.
- No visual change: same crops, same layout breakpoints, same alt semantics.
- `src` always points at the smallest variant (mobile-first default); larger variants only via `srcset`.
- `npm run build` and `npm run lint` and `npm run format` and `npm run test` must all pass.

# Tasks

- [X] Task 1 — Generate and check in derivatives
  - [X] Banner: `src/assets/banner/landing_page_banner-400.webp`, `-800.webp`, plus resized PNG fallbacks at the same widths. Masters stay untouched.
  - [X] Logo: `src/assets/navbar/app_logo-72.webp`, `-144.webp`, plus resized PNG fallbacks. Masters stay untouched.
  - [X] Gate — `git status` shows only new asset files; encode high-quality (visually lossless at display size); full-res WebP each ≤60KB, mobile defaults ≤10KB.

- [X] Task 2 — Responsive banner (`src/components/Banner/Banner.tsx`)
  - [X] Replace bare `<img>` with `<picture>`: WebP `source` (`type="image/webp"`, `srcset` 400w/800w + `sizes` matching mobile cover vs desktop strip) + PNG fallback `<img>` (`src` = 400w PNG, same `srcset`/`sizes`, same `alt`, intrinsic attrs of the 400w file, `fetchpriority="high"`, `decoding="async"`). No blur-up placeholder; the sunk `.visual` background stays the loading state.
  - [X] Extend `Banner.test.tsx` alongside: fallback `img` keeps `alt` + `width`/`height`; `source` carries WebP `type` + `srcset`; `img src` is the smallest variant.
  - [X] Gate — file green in `npm run test -- Banner`.

- [X] Task 3 — Responsive logo (`src/components/Navbar/Navbar.tsx`)
  - [X] Same `<picture>` pattern: WebP `source` (72w/144w) + PNG fallback `<img>` (`src` = 72w PNG, `width`/`height` = `ICON_XL_PX`, same `alt`, `decoding="async"`).
  - [X] Extend `Navbar.test.tsx` alongside: fallback `img` keeps `alt` + `width`/`height`; `source` carries WebP `type` + `srcset`; `img src` is the smallest variant.
  - [X] Gate — file green in `npm run test -- Navbar`.

- [X] Task 4 — Tab icon (`public/` + `index.html`)
  - [X] Generate from the logo master, beige square kept: `public/favicon.ico` (16/32 multi-size), `public/favicon-32x32.png`, `public/apple-touch-icon.png` (180).
  - [X] `index.html`: add icon links + `theme-color` (canvas `#FAF8F5`). No manifest.
  - [X] Gate — icon visible in a desktop tab; `npm run build` copies the files to `dist/` untouched.

- [X] Task 5 — Budget proof
  - [X] Report mobile image bytes before/after from `dist/` output.

# Acceptance

- Mobile default downloads ~6KB of images (400w banner + 72px logo) instead of ~2.5MB, with PNG fallback intact for old browsers.
- Browser tab shows the logo icon; iOS bookmark uses the touch icon; no manifest.
- No pixel/layout change on mobile, rotated, or desktop; existing banner cap and logo circle rules untouched.
- Full `npm run test` (browser, Chromium) green + `npm run build` + `npm run lint` + `npm run format` green.
