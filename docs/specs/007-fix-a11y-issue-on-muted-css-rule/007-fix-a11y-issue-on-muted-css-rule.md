# Why

We accepted in the new trsting layer from spec 006 to have red tests: the soft gray (`muted`) used for the search character counter does not meet WCAG AA contrast criteria on its white card. The same token serves as the search input's placeholder hint on the parchment field background, where contrast is even lower. Both usages are functional features, and thus cannot be allowed to not be WCAG compliant.

# What

Darken the shared `muted` color token by one step: still the same quiet gray to the eye, but now meeting WCAG AA for small text on white, with margin. The `DESIGNmd` will also be modified accordingly.
Full `npm run test` green with zero test-file changes to prove the fix is the right one.

# Constraints

- Follow `AGENTS.md` rules at all times; `DESIGN.md` may be modified ONLY for the `muted` changes.
- Token mirror rule: the `DESIGN.md` frontmatter value and `--color-muted` in `src/globals.css` change together, same value.
- No per-component color overrides, no new tokens, no hardcoded colors outside tokens.
- No markup changes, no test changes: the existing axe checks must pass as written.
- `npm run build` and `npm run lint` and `npm run format` and `npm run test` must all pass.

# Tasks

- [X] Task 1 — Darken the `muted` token
  - [X] Set `muted` in `DESIGN.md` frontmatter and `--color-muted` in `src/globals.css` to `#626964` (full-compliance choice: passes on white and on parchment; visibly darker than the old gray).
  - [X] Verify the counter meets WCAG AA for small text on the white card, and the placeholder hint meets WCAG AA on the parchment field (resting and focused states).
  - [X] Verify by eye on mobile and desktop: the gray still reads as hushed secondary text, not body copy.
  - [X] Gate — no other color, layout, or markup changed; `DESIGN.md` diff limited to the `muted` value.

- [X] Task 2 — Retire the known issue
  - [X] Remove the contrast known-issue note from `AGENTS.md` Testing Strategy (or rewrite it as resolved history, one line max).
  - [X] Gate — full `npm run test` green + `npm run build` + `npm run lint` + `npm run format` green.

# Acceptance

- `npm run test` (browser, Chromium) fully green with zero test-file changes since the red state.
- Counter and placeholder hint meet WCAG AA for small text; the gray keeps its quiet secondary role visually.
- No new colors, no overrides, no markup changes; `DESIGN.md` diff limited to the `muted` value.<>
