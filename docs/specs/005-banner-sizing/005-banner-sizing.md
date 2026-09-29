# Why

The banner image fills the whole viewport on desktop — tall AND large — while mobile is fine.

- The desktop cap lives behind three simultaneous conditions (`Banner.module.css`): container ≥64rem AND viewport height ≥600px AND viewport aspect ≤2/1. The base mobiles rule takes over too easily even on wide screen.
- The guard stack uses `@container`, too young for the target population (needs Chrome 105+ / Safari 16+). Layout must work on plain `@media`, supported everywhere.
- The tablet range (768–1023px) has no image rule at all — full-width 16/9 by default, the banner is too big.

# What

Rebuild banner + page-shell responsiveness on strong, old-browser-safe CSS.

1. Plain `@media` only, in every component, no `@container`. Single query system.
2. Two breakpoints only: mobile base, desktop treatment at `min-width: 48rem`. No tablet-specific rules.
3. Width-gated image cap: mobile keeps fluid `16/9 cover`; at `≥48rem` the banner becomes today's small centered strip. No height/aspect guards on the desktop step.
4. Short-viewport override for rotated screens (any width, `max-height: 37.5rem`): trims image height + loosens centering, declared after the desktop block so it always wins.

# Constraints

- Follow `AGENTS.md` + `DESIGN.md` at all times
- No `@container` anywhere in layout (all 5 files); no external CDN `<link>` or added dependencies.
- Mobile-first: base = mobile, desktop = variation at `48rem`.
- Old-browser-safe: every modern unit gets a legacy fallback line first (`vh` before `svh`); `:has` gets a `:focus-within` fallback; `aspect-ratio` stays progressive enhancement over `width`/`height` attrs.
- DESIGN.md documents the two-breakpoint rule (explicit user-approved exception to the no-edit rule).

# Tasks

- [X] Task 1 - Single `48rem` `@media` step, all files
  - Goal: one query system, one step up, old browsers included.
  - Implementation:
    - [X] Convert every `@container app` blocks to plain `@media (min-width: 48rem)`.
    - [X] At `≥48rem` apply today's desktop shell geometry directly (3rem margins, `1120px` centered). No intermediate tablet values; delete the `64rem` tier everywhere.
    - [X] At `≥48rem` the banner takes today's desktop strip verbatim: `.visual` `fit-content` + centered, `.image` `contain`, `max-height: 220px`; mobile base keeps fluid `16/9 cover` unchanged.
    - [X] Remove `container-name: app` / `container-type` once no `@container` remains.
    - [X] Drop the `min-height: 37.5rem` + `max-aspect-ratio: 2/1` guards from the desktop step.

- [X] Task 2 - Short-viewport override (rotated screens)
  - Goal: wide-but-short windows stay sane without aspect-ratio gates.
  - Implementation:
    - [X] After the desktop block, add `@media (max-height: 37.5rem)` override: cap image with `vh`-then-`svh` fallback pair (e.g. `calc(50vh - var(--navbar-h))` then `calc(50svh - var(--navbar-h))`), keep `cover` crop; loosen `callToAction` centering as today.
    - [X] Order matters: short-viewport block comes last so it beats the desktop cap. Put all `@media` instructions at end of files.

- [X] Task 3 - Document + validate
  - Goal: the two-breakpoint rule is written down and the gate is green.
  - Implementation:
    - [X] DESIGN.md Layout section states the two breakpoints (mobile base / `≥48rem` desktop, tablet = desktop) and the width-gated-cap + short-viewport-override principles.
    - [X] Done: `build`, `lint`, `format` pass. Manual viewport check by the developer.

# Acceptance

- `npm run build` + `npm run lint` + `npm run format` pass.
- No `@container` remains in layout; `≥48rem` = desktop everywhere; short windows stay bounded via the trailing `max-height` override.
