---
name: Tanuki Sensei
colors:
  surface: '#f8f9ff'
  surface-dim: '#d8dae1'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fa'
  surface-container: '#ecedf5'
  surface-container-high: '#e6e8ef'
  surface-container-highest: '#e1e2e9'
  on-surface: '#191c21'
  on-surface-variant: '#414943'
  inverse-surface: '#2e3036'
  inverse-on-surface: '#eff0f7'
  outline: '#717973'
  outline-variant: '#c1c9c1'
  surface-tint: '#3b6750'
  primary: '#002b1a'
  on-primary: '#ffffff'
  primary-container: '#14422d'
  on-primary-container: '#80ae93'
  inverse-primary: '#a1d1b4'
  secondary: '#835337'
  on-secondary: '#ffffff'
  secondary-container: '#febe9b'
  on-secondary-container: '#794b2f'
  tertiary: '#510300'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a0600'
  on-tertiary-container: '#ff7e69'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bdeed0'
  primary-fixed-dim: '#a1d1b4'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#224f39'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#f8b996'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#673c22'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a7'
  on-tertiary-fixed: '#400200'
  on-tertiary-fixed-variant: '#8c1709'
  background: '#f8f9ff'
  on-background: '#191c21'
  surface-variant: '#e1e2e9'
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
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
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

## Layout & Spacing

The layout follows a disciplined **column-based fluid system** governed by strict maximum reading widths to preserve meditative visual pacing.

### Layout Scaling
- **Mobile (<768px):** 4-column layout. Margin is locked to `1rem` (16px) to maximize screen area for intricate Kanji study cards while retaining outer breathing space.
- **Tablet (768px–1023px):** 8-column layout. Canvas margins expand to `2rem` (32px), introducing side-by-side study panes (Kanji glyph alongside origin timeline).
- **Desktop (≥1024px):** 12-column layout with a constrained maximum canvas width of `1120px`. The study card canvas remains tightly centered to eliminate sweeping head movement.

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
- **Focus State:** Transitions background to `#FFFFFF`, border color shifts cleanly to `#2D5A43` (Matcha), accompanied by an ambient matcha glow (`0 0 0 3px rgba(45, 90, 67, 0.12)`). No sharp native outlines.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** `rounded-md` (6px), 1.5px border `#8C5B3E`. When checked, fills with `#2D5A43` displaying a crisp white ink-check glyph.
- **Radio Buttons:** Concentric circular forms. Active state reveals an inner cinnabar vermilion stone center against a clean white moat.

### Etymological Breakdown Lists
- List rows sit on transparent bases separated by dotted dividers (`#E6E0D6`). Left column anchors the radical pictograph inside a square `#F3EFEA` tile; right column presents historical narrative in `body-md` typography.