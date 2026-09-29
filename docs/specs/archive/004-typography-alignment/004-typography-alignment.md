# Why

The typography rules are inconsistent in the app.

- Type scale is half-applied for texts: tokens exist in `DESIGN.md:17-89` but are unused. `Explanation` heading and item titles and search input matches no token.
- Scaling is inconsistent for texts
- Color frontmatter (`DESIGN.md:3-16`) contradicts prose palette (washi `#FAF8F5`, matcha `#2D5A43`…) and CSS vars (`globals.css:11-23`).
- Bilingual unreadiness: `--font-head` (`globals.css:26`) has no JP fallback (Epilogue has no kana/kanji); only Noto 400 loaded (`globals.css:6`); no `:lang(ja)` rules (letter-spacing 0.01–0.08em harms kana; JP needs taller LH, 400–600 weight).
- A11y undocumented: "Maximum WCAG compliance" (`AGENTS.md:41`) has no operational rules in DESIGN.md.

# What

Make typography more consistent in the app.

1. Rewrite DESIGN.md frontmatter typography + colors to 1:1 mirror CSS vars so it becomes self-sufficient.
2. Globals-first type: element defaults in `src/globals.css`; components overrides only as named exception tokens.
3. Bilingual: `lang="ja"` spans/classes + `:lang(ja)` resets, Noto 600 fallback in head stack.
4. Full `## Accessibility` section in DESIGN.md
5. Stepped responsive type + max-contrast color roles + rem units.

# Constraints

- Follow `AGENTS.md` + `DESIGN.md` at all times
- `DESIGN.md` stays valid per official guidelines: [https://github.com/google-labs-code/design.md/blob/main/docs/spec.md].
- Tokens normative, prose context. No hardcoded variables outside `var(--...)`.
- Mobile-first: base = mobile, desktop = variation.
- No external CDN `<link>` or added dependencies not already in project.

# Tasks

- [X] Task 1 - DESIGN.md frontmatter: colors
  - Goal: one shared color language between `DESIGN.md` and code, so a reader can map every prose color name to exactly one variable.
  - Implementation:
    - [X] Replace the Material default colors with the washi functional set, mirroring `globals.css`: `canvas` (Raw Washi), `surface` (Pure Kozo), `sunk` (Aged Parchment), `border` (Dried Bamboo), `ink` (Sumi), `ink-soft`, `muted`, `primary` (Deep Matcha) + `primary-hover`, `secondary` + `secondary-tint`, `tertiary`. Keep `on-primary` (add further `on-*` only where actually used).
    - [X] Poetic names survive as prose aliases only, never as variable names. Code uses functional names (`ink`, `sunk`), prose may call them Sumi or Aged Parchment.
    - [X] Gate: every `--color-*` in `globals.css` has exactly one frontmatter key and vice versa. To satisfy it, `--color-on-primary` was added to CSS and the frontmatter kept `on-primary` with no CSS counterpart otherwise.

- [X] Task 2 - DESIGN.md frontmatter: typography
  - Goal: every text size in the app maps to exactly one named token, and use tokens in components.
  - Implementation:
    - [X] Keep all existing tokens with their exact metrics (`display-kanji-lg/sm`, `headline-xl` 20/28 700 letter spacing -0.01em, `headline-lg` 24/32 600 -0.01em, `headline-md` 18/26 600 0, `body-lg/md/sm`, `label-md/sm`).
    - [X] Title downsizes after visual reviews (hero dominated the page, `h2` row truncated at 320px): `headline-xl` desktop 36/44 → 32/40 → 24/32 → 20/28 with mobile base 18/26; `headline-md` 20/28 → 18/26. Decision: the hero never outweighs the navbar title (desktop `h1` 20/700 vs navbar 24/600), so brand + call-to-action lead.
    - [X] Add missing headline `headline-sm` (Epilogue 16/24, weight 600).
    - [X] Add `input-cta` with same size as `body-lg` (18/28) but Kanji-first stack at weight 400. Used only for specific call to action input components so that it stands out.
    - [X] Remove `headline-xl-mobile` as a separate token. Responsive behavior belongs to globals, not to the token list.
    - [X] Frontmatter stays in px for readability; the prose `## Typography` section carries the px→rem conversion table (CSS uses rem = px ÷ 16).
    - [X] Load Noto Sans JP 600 so full-Japanese headings render without synthetic bolding.

- [X] Task 3 - `src/globals.css` element base stepping
  - Goal: shared tokens live in globals, in a detailed form, not in components
  - Implementation:
    - [X] Base: `body`/`p` = `body-md`; `h1` = `headline-xl` mobile default (18/26, same vars); `h2` = `headline-md`; `h3` = `headline-sm`; `input` = `input-cta`; `label` = `label-md`. All in `ink`.
    - [X] At `min-width: 48rem`: `body`/`p` swap to the `body-lg` vars; the same block reassigns `--text-headline-xl-*` to the desktop spec (20/28). Labels, `body-sm`, `input-cta` stay fixed.
    - [X] `:lang(ja)` reset: letter spacing 0, taller line height (1.75), strict line breaking, weight 400 with headings capped at 600 on the Kanji stack.
    - [X] Remove double-scaling now owned by globals: `font-size/line-height` on `.pageContent` (`App.module.css`) and the pitch scale-up block (`Banner.module.css`).

- [X] Task 4 - Component migration
  - Goal: Apply rules to components
  - Implementation:
    - [X] Convention: explicit longhand properties everywhere (`font-family`, `font-weight`, `font-size`, `line-height`, `letter-spacing`) using granular `var(--text-<token>-weight/size/leading/spacing)` + `var(--font-*)` and not as `font:` shorthand, same as globals base.
    - [X] Banner: bare Epilogue `h1` (inherits globals `headline-xl`, no component type rules) above pitch; pitch `h1`→`p` keeping `body-md` vars. Caption keeps `label-md` vars.
    - [X] Navbar title: `headline-md` to `headline-lg` vars; `nowrap+ellipsis` kept; stays at 24px per user preference — the hero stays under it (desktop 20px), never bigger. 320px check: brand + home button fit in 288px content width with ellipsis as guard (computed from real font advances — no browser in this env).
    - [X] Explanation: `h2` to `headline-sm` vars (16px — measured 191px, fits one line on standard screens next to the 78px tag); item `h3` to `headline-sm` vars; item text to `body-sm` in `ink` (was `ink-soft`); tag to `label-sm` vars keeping its uppercase. `nowrap` declares the one-line intent; below 360px the decorative tag hides so the line always fits (measured budgets: 162px at 320px, 202px at 360px).
    - [X] SearchBar: label to `label-md` vars; input to `input-cta` vars (Kanji-first stack, weight 400 — was 600); counter to `label-sm` vars + added the missing `text-transform: uppercase`.
    - [X] `:lang(ja)` spans: no Japanese spans exist in components yet — the globals reset from Task 3 covers them when added.
  - Done: `build`, `lint`, `format` pass.

- [X] Task 5 - Color roles + focus visibility
  - Goal: follow a11y recommendations — predictable text colors with weak contrasts on non-essential UI only, and an always-visible keyboard focus indicator.
  - Implementation:
    - [X] SearchBar keyboard focus: single rounded 2px `primary` ring via the shared global `.field` class (keyboard-only); the input itself keeps `outline: none` in globals; mouse focus keeps the green border+glow. One green line, never two.
    - [X] SearchBar counter `ink-soft` to `muted`: counters are non-essential UI, so the weaker color is allowed there (never on `sunk` backgrounds).
    - [X] Navbar title stays `primary`: AAA contrast on `canvas`, so brand keeps its color with no contrast cost.

- [X] Task 6 - `## Accessibility` section in DESIGN.md
  - Goal: a11y becomes checkable rules in DESIGN.md
  - Implementation:
    - [X] Contrast floors (AAA reading copy, AA large-text minimum, `muted` banned list), focus (2px `primary` ring, `.field` pattern), 44px targets, reduced-motion, heading order, `label-sm`/uppercase/`lang="ja"` rules.
    - [X] Fixed the stale Components focus bullet ("No sharp native outlines" contradicted the ring — rewritten to keyboard-ring vs mouse border+glow).
    - [X] Submit button 36px→44px so the targets rule holds in code, not just prose. No motion exists in the codebase yet, so reduced-motion binds future work.

- [X] Task 7 - new `## Agent usage` section + AGENTS.md pointer
  - Goal: DESIGN.md alone is enough for any coding agent; AGENTS.md just points at it.
  - Implementation:
    - [X] `## Agent usage` added (self-sufficiency, tokens normative, globals-first, standing patterns, validation incl. design.md spec link). AGENTS.md DESIGN section shrunk to the pointer; the stale `src/index.css` path went away with it (actual file is `src/globals.css`).

# Acceptance

- `npm run build` + `npm run lint` + `npm run format` pass.
- `DESIGN.md` valid per design.md spec doc; frontmatter keys as `--var` 1:1 (no orphans either direction); no hardcoded type/color outside vars.
