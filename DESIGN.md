---
name: Tanuki Kanji
colors:
  canvas: '#faf8f5'
  surface: '#ffffff'
  sunk: '#f3efea'
  border: '#e6e0d6'
  ink: '#22252a'
  ink-soft: '#414943'
  muted: '#717973'
  primary: '#2d5a43'
  primary-hover: '#3a7356'
  secondary: '#8c5b3e'
  secondary-tint: 'rgba(140, 91, 62, 0.1)'
  tertiary: '#c83e2b'
  on-primary: '#ffffff'
typography:
  display-kanji-lg:
    fontFamily: Noto Sans JP
    fontSize: 72px
    fontWeight: '400'
    lineHeight: 80px
    letterSpacing: 0px
  display-kanji-sm:
    fontFamily: Noto Sans JP
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: 0px
  headline-xl:
    fontFamily: Epilogue
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Epilogue
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans, Noto Sans JP, sans-serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans, Noto Sans JP, sans-serif
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Plus Jakarta Sans, Noto Sans JP, sans-serif
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans, Noto Sans JP, sans-serif
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans, Noto Sans JP, sans-serif
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  input-cta:
    fontFamily: Noto Sans JP, Plus Jakarta Sans, sans-serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
components:
  icon-sm:
    size: 1rem
  icon-md:
    size: 1.25rem
  icon-xl:
    size: 2.25rem
---

## Brand & Style

This design system blends **Tactile Japanese Minimalism** with a warm, meditative editorial quality. The experience captures the quiet discipline of calligraphy combined with the approachable charm of traditional folklore. Rather than sterile gamification streaks and abrasive neon alerts, the UI behaves like living washi stationery—tactile, breathable, and grounded in centuries of cultural memory.

### Aesthetic Principles
- **Wabi-Sabi Serenity:** Uncluttered layouts with generous negative space, gentle organic contrast, and balanced typographic cadence.
- **Folklore Warmth:** Interactive cues and micro-accents reflect roasted tea (*hojicha*), aged cedar wood, and moss-draped temple gardens.
- **Etymological Reverence:** Stroke histories, radical breakdowns, and pictographic evolutions are treated as cultural artifacts through intentional framing, seal stamps, and artifact cards.
- **Mindful Progression:** Micro-interactions favor fluid, soft-damped eases over bouncy, chaotic arcade animations.

## Colors

The color palette draws directly from classical Japanese mineral pigments (*iwa-enogu*) and organic materials:

- **Primary (`#2D5A43` Deep Matcha / Koke Moss):** Represents focus, growth, and grounding presence. Applied to key navigation markers, dominant CTA actions, and mastery indicators.
- **Secondary (`#8C5B3E` Roasted Tea / Hojicha Cedar):** Radiates warmth, craft, and organic structure. Applied to radical components, etymological timelines, and secondary interactive states.
- **Tertiary (`#C83E2B` Cinnabar / Shunin Vermilion):** Inspired by Japanese Hanko seals and shrine torii gates. Reserved strictly for etymology anchors, stamp badges, critical memory hooks, and subtle callouts.
- **Neutral Core (`#22252A` Sumi Ink):** Deep soot slate delivering high-contrast, effortless legibility without the harshness of pure black.

### Surface System
- **Canvas Base (`#FAF8F5` Raw Washi):** Primary viewport backdrop mimicking untreated handmade paper.
- **Surface Elevation (`#FFFFFF` Pure Kozo):** Resting container state for interactive flashcards, character sheets, and reader trays.
- **Surface Sunk / Subtle (`#F3EFEA` Aged Parchment):** Used for input backgrounds, radical component trays, and segmented controls.
- **Border Subtle (`#E6E0D6` Dried Bamboo):** Structural dividers and non-structural boundaries with ultra-low visual noise.

## Typography

The typographic hierarchy balances character clarity and etymological warmth:

- **Epilogue (Headings):** Selected for its sturdy geometric structure and distinct editorial warmth. Provides an organic rhythm without feeling overly historical.
- **Plus Jakarta Sans (Body Text & Etymological Lore):** Delivers clean readability on mobile screens with authentic character rendering that reduces reading fatigue during long study sessions.
- **Plus Jakarta Sans (Labels & Technical Annotations):** Employs precise, clean metrics for JLPT levels, stroke counters, radical classifications, and pronunciation pitch guides.
- **Kanji Rendering Scale:** Kanji glyphs require dedicated, uncompressed visual height. Never compress Kanji line-height; prioritize generous vertical breathing space to preserve stroke terminal subtleties and radical balance.
- **Uppercase Is Application, Not Token:** `label-md` and `label-sm` carry letter spacing only. Uppercase comes from `text-transform: uppercase` wherever the token is used — never treat the token itself as "the uppercase style", and never let uppercase alone carry meaning.
- **Mobile Default, Desktop Override:** an unadorned token value is the mobile default. When a token steps up on larger screens, the 48rem media block reassigns the *same* variable — consumers never change. Today only `headline-xl` steps (18/26 base → 20/28 frontmatter spec, deliberately capped well under the navbar title size — brand and call-to-action lead, the hero supports); all other tokens keep one fixed size.
- **Search Input (`input-cta`):** Same metrics as `body-lg` (18/28, 400 weight) with the Kanji-first stack (`Noto Sans JP, Plus Jakarta Sans, sans-serif`). Applies to the call-to-action search input — large enough to invite typing, light enough to stay body copy.
- **Units:** Frontmatter lists px for readability; CSS consumes rem throughout (px ÷ 16): 72/80→4.5/5rem, 48/56→3/3.5rem, 24/32→1.5/2rem, 20/28→1.25/1.75rem, 18/28→1.125/1.75rem, 18/26→1.125/1.625rem, 16/24→1/1.5rem, 15/24→0.9375/1.5rem, 13/20→0.8125/1.25rem, 12/16→0.75/1rem, 10/14→0.625/0.875rem.
- **Japanese Weight:** Noto Sans JP loads in 400 and 600 so full-Japanese headings render at up to 600 weight without synthetic bolding.

## Layout & Spacing

The layout follows a disciplined **column-based fluid system** governed by strict maximum reading widths to preserve meditative visual pacing.

### Layout Scaling
Two breakpoints only — mobile base, desktop variation at `48rem` (768px). Tablet is desktop: no tablet-specific rules.

- **Mobile (<768px):** 4-column layout. Margin is locked to `1rem` (16px) to maximize screen area for intricate Kanji study cards while retaining outer breathing space.
- **Desktop (≥768px, tablet included):** 12-column layout with `3rem` (48px) margins and a constrained maximum canvas width of `1120px`. The study card canvas remains tightly centered to eliminate sweeping head movement.
- **Banner cap (width-gated):** mobile keeps a fluid `16/9` cover crop; at `≥48rem` the banner becomes a small centered strip (`contain`, `220px` max-height). Desktop engages on width alone — never on height or aspect-ratio.
- **Short viewports:** `@media (max-height: 37.5rem)` at any width restores the cover crop with a `vh`/`svh` fallback cap and loosens vertical centering. Declared after the desktop block so it always wins (rotated screens).

### Vertical Rhythm
A base unit of `0.5rem` (8px) governs component padding and stack margins. Component internals utilize `space-md` (16px) for compact widgets and `space-xl` (40px) between distinct study units to preserve tranquility.

## Elevation & Depth

This system intentionally rejects harsh, generic drop shadows in favor of **Tonal Paper Layering** and **Sumi-Tinted Ambient Diffusions**.

### Depth Layers
- **Level 0 (Canvas):** Base raw washi (`#FAF8F5`). Un-elevated.
- **Level 1 (Study Cards & Content Surfaces):** Pure paper container (`#FFFFFF`) framed by a hairline border (`1px solid #E6E0D6`) combined with a soft, warm ambient bloom: `box-shadow: 0 4px 20px -2px rgba(34, 37, 42, 0.04), 0 1px 3px 0 rgba(34, 37, 42, 0.02)`.
- **Level 2 (Active Cards & Floating Drawers):** Lifted interactive cards (e.g., active stroke-order tracer, dragged components): `box-shadow: 0 12px 32px -4px rgba(45, 90, 67, 0.08), 0 4px 8px -2px rgba(34, 37, 42, 0.04)`. Note the subtle matcha pigment tint in the shadow core.
- **Level 3 (Modals & Radical Inspector Sheets):** Grounded overlays utilizing backdrop filters (`backdrop-filter: blur(8px)`) over a translucent washi tint (`rgba(250, 248, 245, 0.85)`).

## Shapes

The shape system employs consistent **16px–20px (`rounded-lg` / `rounded-xl`) curves**, imparting the gentle tactility of river stones (*tobi-ishi*) and polished cedar blocks.

### Application Rules
- **Study Containers & Flashcards:** `rounded-xl` (20px) to soften the perimeter and focus attention inward.
- **Buttons, Text Inputs & Interactive Tiles:** `rounded-lg` (12px–16px) ensuring comfortable, approachable touch targets.
- **Radical Pills, Stamp Badges, and Status Chips:** Pill-shaped (`rounded-full`) to contrast against rectangular artifact cards.
- **Seal Stamps (Hanko Badges):** Slightly softened square silhouettes (`rounded-md`, 6px) with an irregular, subtly textured border simulating real seal ink pressed onto fibers.

## Iconography

All icons are Material Symbols (outlined) rendered as square glyphs in three sizes. Each size is a `components` token (`icon-sm` / `icon-md` / `icon-xl`) carrying a single `size` property — deliberately kept out of the `spacing` scale, which is reserved for layout rhythm (margins, gutters, padding). Iconography is a component concern, not a layout one.

The three values step with the `0.5rem` (8px) base unit: `1rem` is two units, `1.25rem` two and a half, `2.25rem` four and a half. In pixels at the default root size that is 16 / 20 / 36 — the same numbers that feed intrinsic `width` / `height` attrs via `src/constants/globals.ts` (`ICON_SM_PX` / `ICON_MD_PX` / `ICON_XL_PX`), while CSS consumes `var(--icon-*)`. The full chain for any icon is therefore `components.icon-*.size` → `--icon-*` → `ICON_*_PX`, so attr and rendered size always agree and pre-CSS layout stays stable.

- **Small (`icon-sm`, `1rem` / 16px):** Inline label glyphs and list item badges — SearchBar label, Explanation items, Banner badge.
- **Medium (`icon-md`, `1.25rem` / 20px):** Action and header badges — SearchBar submit, Explanation header, Navbar home mark.
- **Extra large (`icon-xl`, `2.25rem` / 36px):** Brand logo only.

Never introduce a new icon size without a design decision; when in doubt, reuse the nearest existing size rather than adding a fourth.

## Components

### Buttons
- **Primary (Matcha Action):** Background `#2D5A43`, sumi text `#FFFFFF`, subtle inner bevel highlight. Hover shifts to `#3A7356` with a gentle 1px upward translation.
- **Secondary (Hojicha Wood):** Subtle tinted fill `rgba(140, 91, 62, 0.1)`, solid text `#8C5B3E`, 1px border `rgba(140, 91, 62, 0.25)`.
- **Tertiary / Ghost:** No background, sumi text with an underline that animates outward from center on hover.

### Character & Etymology Cards
- **Base Style:** `#FFFFFF` background, `rounded-xl`, subtle bamboo outline (`#E6E0D6`).
- **Header:** Epilogue JLPT badge docked top-right; primary Kanji character set in `display-kanji-lg` anchored center-left with gentle Sumi Ink tone.
- **Timeline Strip:** Embedded horizontal sequence tracking character evolution (Oracle Bone script → Bronze script → Seal script → Modern Kanji) connected by a dashed hojicha thread.

### Micro-Badges & Hanko Seals
- **Hanko Seal Stamp:** Square rounded (6px), 1px solid `#C83E2B`, background `rgba(200, 62, 43, 0.06)`, text in `#C83E2B` uppercase. Evokes traditional authentication seals.
- **Radical Chip:** Full pill (`rounded-full`), background `#F3EFEA`, border `1px solid #E6E0D6`, text `#22252A`. Displays component meaning and stroke count.

### Input Fields & Search Bars
- **Style:** Background `#F3EFEA`, 1px solid `#E6E0D6`, text in Sumi Ink.
- **Focus State:** Mouse focus transitions background to `#FFFFFF`, border to `#2D5A43` (Matcha), plus an ambient matcha glow (`0 0 0 3px rgba(45, 90, 67, 0.12)`). Keyboard focus instead shows a single rounded 2px `#2D5A43` outline (offset 2px) on the field wrapper — the glow may augment it, never replace it. One green line, never two; see `## Accessibility`.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** `rounded-md` (6px), 1.5px border `#8C5B3E`. When checked, fills with `#2D5A43` displaying a crisp white ink-check glyph.
- **Radio Buttons:** Concentric circular forms. Active state reveals an inner cinnabar vermilion stone center against a clean white moat.

### Etymological Breakdown Lists
- List rows sit on transparent bases separated by dotted dividers (`#E6E0D6`). Left column anchors the radical pictograph inside a square `#F3EFEA` tile; right column presents historical narrative in `body-md` typography.

## Accessibility

Checkable rules — "Maximum WCAG compliance" made operational. Every rule below binds code today, not aspiration.

- **Contrast floors:** Reading copy targets AAA. Large text takes AA as its minimum. `muted` never carries body copy and never sits on `sunk`; it serves placeholders, counters, disabled states, and decorative marks only. Caption white (`surface`) appears only over the banner dark gradient.
- **Focus is always visible:** `:focus-visible` draws a 2px `primary` outline with 2px offset. Glow may augment the ring, never replace it. Borderless inputs keep `outline: none` in globals; every input wrapper adds the shared `.field` class, which carries the single ring via `:has(input:focus-visible)` — never outline the input box itself, never two green lines.
- **Targets:** Every interactive target measures at least 44×44px.
- **Motion:** `prefers-reduced-motion` disables translation and animation — including the hover translations described under `## Components` once built. The codebase currently ships no motion, so the rule binds future work.
- **Structure:** Heading order runs `h1 → h2 → h3` with no skips. `label-sm` never carries essential copy. Uppercase small labels keep their letter-spacing token for legibility and never carry meaning alone. Japanese spans and blocks require `lang="ja"` so the `:lang(ja)` reset applies.

## Agent usage

This document is self-sufficient: frontmatter holds exact values, prose explains how to apply them. Follow it strictly; when any other output conflicts with it, this document wins. Never edit it during a feature task.

- **Tokens are normative, prose is context:** frontmatter (`colors`, `typography`, `rounded`, `spacing`, `components`) defines exact values. Never hardcode colors, fonts, spacing, or radii outside tokens.
- **Globals first:** webapp-wide variables and base styles live in `src/globals.css`. Component files (`src/components/*/*.module.css`, CSS Modules + native `var()`) only consume tokens via `var(--...)`. No per-component token redefinition.
- **Apply the standing patterns:** mobile-first base styles with desktop as variation; stepped tokens reassign the *same* variable; `:lang(ja)` on Japanese text; `.field` on every input wrapper; contrast and focus rules from `## Accessibility`.
- **Validate every change:** frontmatter keys mirror `--var` 1:1 with no orphans either direction, and `npm run build` + `npm run lint` + `npm run format` pass. This document itself stays valid per the specification at [https://github.com/google-labs-code/design.md/blob/main/docs/spec.md].