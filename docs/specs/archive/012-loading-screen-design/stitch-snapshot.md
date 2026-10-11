# Stitch snapshot — Loading screen (vendor-independent backup)

This file + `stitch-loading-screen.html` + the two `stitch-*.jpg` files are the
self-contained backup of the Stitch design. A reader without Stitch access must
be able to implement spec 012 from these files alone. The Stitch project ID
below is provenance only, never a build input.

## Provenance

- Stitch project: "Tanuki Kanji Loading Screen", ID `17727976435008157775`
  (`PRIVATE`, `TEXT_TO_UI_PRO`, exported 2026-10-08).
- Normative screen: "Tanuki Kanji - Loading Etymology Lesson",
  screen ID `b7d1838f63af436bb53684011e455a80`, `MOBILE`, 780×1768.
- Raw export vendored as `./stitch-loading-screen.html` (verbatim, including its
  Tailwind CDN + Google Fonts links, which are Stitch scaffolding and are
  FORBIDDEN in our build — see Divergences).
- Screenshots vendored as `./stitch-loading-screen-shot.jpg` (full screen) and
  `./stitch-tanuki-artwork.jpg` (center artwork). Live Stitch image URLs expire;
  runtime must use local `src/assets/loading/*` files, never hotlink Stitch.
- Related Stitch image prompts in the same project (background-flattened tanuki
  artwork on `#FAF8F5`) back `loading_page.png`; the hires local file
  `./loading_page.png` remains the runtime asset source.

## Copy deck (verbatim from Stitch)

- Brand: "Tanuki Kanji".
- Header right control: `aria-label="Refresh or reset"`, glyph `sync`.
- Artwork alt: "Meditative Tanuki consulting ancient wisdom".
- Logo alt: "Tanuki Kanji Logo".
- Initial caption: "Uncovering folklore and cultural memory..."
- Rotating captions (4, in order, 3500ms interval, 300ms fade):
  1. "Tanuki Kanji is consulting the scriptures..."
  2. "Tracing radical origins & ancient brushwork..."
  3. "Uncovering folklore and cultural memory..."
  4. "Handcrafting your authentic etymology lesson..."

## Layout (mobile, from raw export)

- Fixed top header (`h-14`, `max-w-[412px]` centered): left round logo (`h-8 w-8`,
  `rounded-full`) + bold headline title; right icon control.
- Main content centered horizontally AND vertically (`flex-1`, `items-center`,
  `justify-center`, `max-w-[412px]`, `px-6`), directly on canvas — NO white card
  wrapper.
- Centerpiece `w-72 h-72` (288px) relative stack, in paint order:
  1. Warm glow disc (`w-64 h-64`, tan/khaki gradient `#E6DECF/#EAE3D2/#E1D7C6`,
     `blur-2xl`, pulse 4s).
  2. Expanding ring (`inset-0`, 1px `#835337` at 15%, ping 4.8s infinite).
  3. Enso ring 1: full-bleed SVG, `#2D5A43` 1.5px dashed (`12 18 120 28`,
     opacity 0.28), slow spin 26s + 2 accent dots.
  4. Enso ring 2: inset-2 SVG, `#835337` 1.2px dashed (`24 36 80 40`,
     opacity 0.24), counter-spin 38s + 1 dot.
  5. Four tiny sumi dots (matcha/hojicha, 25–35% opacity, two pulsing 3.2s/4.1s).
  6. Center artwork `w-48 h-48` (192px) circle, `object-contain`,
     `mix-blend-mode: multiply` so edges melt into `#FAF8F5`, breathing
     (scale 1→1.02, −3px lift, 4.5s ease-in-out infinite).
- Caption block: `mt-8` (32px below visualizer), centered, `min-h-[48px]`
  reserve (no layout shift), 15px `#414943` body.

## Motion spec (from raw export)

| Element      | Animation               | Timing                        |
| ------------ | ----------------------- | ----------------------------- |
| Caption swap | linear cycle + 300ms fade | every 3500ms                 |
| Artwork      | breathe (scale/lift)    | 4.5s ease-in-out infinite     |
| Enso 1       | rotate                  | 26s linear infinite           |
| Enso 2       | counter-rotate          | 38s linear infinite           |
| Glow         | pulse                   | 4s                            |
| Ring         | ping                    | 4.8s infinite                 |

Spec 012 Tasks intentionally override the caption cadence (900–2000ms organic
rotation + `prefers-reduced-motion` static fallback); this table records what
Stitch shipped, not what we ship.

## Token map (Stitch → DESIGN.md)

Stitch canvas `#FAF8F5`, surface `#FFFFFF`, border `#E6E0D6`, ink-soft
`#414943`, muted `#626964`, sunk `#F3EFEA`, secondary-tint
`rgba(140,91,62,0.10)` match `DESIGN.md` exactly. Headline `Epilogue`, body
`Plus Jakarta Sans`, kanji `Noto Sans JP` match. Deltas: Stitch primary
`#14422d` vs `DESIGN.md` primary `#2d5a43` (Stitch demotes ours to
`primary-container`); Stitch secondary `#835337` vs ours `#8c5b3e`;
title color `#1a442e` is Stitch-only. `DESIGN.md` wins every conflict.

## Divergences (do NOT port)

- Tailwind CDN script, Google Fonts `<link>`s, `lh3.googleusercontent.com`
  hotlinks → all forbidden by spec Constraints; re-implement with project
  stack, `@fontsource` imports, local assets.
- `maximum-scale=1.0, user-scalable=no`, `overflow: hidden` + hidden
  scrollbars, `body min-height: max(884px, 100dvh)` → forbidden; these break
  zoom and trap content. Follow `DESIGN.md` breakpoints + short-viewport rule.
- Fixed `412px` column cap → our shell uses `DESIGN.md` margins and 1120px max.
- `aria-label="Refresh or reset"` + `sync` glyph → superseded by spec Task 4
  (`"Back to homepage"` button; Stitch predates that decision).
