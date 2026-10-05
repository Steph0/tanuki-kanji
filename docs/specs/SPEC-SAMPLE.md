# Spec sample (template)

Spec unit: `docs/specs/NNN-name/NNN-name.md`. Copy this skeleton for a new spec.

Rule of thumb: a non-technical reader should understand `Why` + `What` fully.
Exact values live in `Tasks`, next to the code they constrain.

```md
# NNN — Feature name

# Why

Product reason: what user problem this solves, in plain language.
No file paths, no function names, no implementation.

# What

User-visible behavior only, as bullets:

- What the user can do / sees in each state (plain words).
- Exact user-facing strings in quotes.
- What explicitly does NOT change in this spec.

Forbidden here: file paths, identifiers, regex/unicode ranges, timings,
event names, CSS selectors/tokens, architecture notes. Those go below.

# Constraints

Short list only — pointers and spec-only rules:

- References to standing rules (`DESIGN.md`, `AGENTS.md`, memory conventions).
- Granted bypasses/exceptions (e.g. an allowed dep install).
- Rules specific to this spec and stated nowhere else (e.g. an architecture
  choice, an explicit out-of-scope).

Forbidden here: exact values (ranges, timings, tokens, attributes, error
shapes), file paths, test conventions — those go in `Tasks`.

# Tasks

- [ ] Task 1 — Product-named step
  - [ ] Product-first phrasing: open with a plain human sentence stating the
        intent, then the technical translation (files, identifiers, values).
        Never the reverse, never the meaning buried in parenthesis after jargon.
  - [ ] Files/symbols to touch, with the exact values this task needs.
        Encode rules in names (constants, types, functions) — not comments.
  - [ ] Tests with the code (unit `*.test.ts` vs integration `*.test.tsx`).
  - [ ] Keep steps small and unitary: one behavior per step, its tests with
        it. Split rather than stack.
  - [ ] Gate — build + lint + format + single-file test, then full test.

# Acceptance

- Observable outcomes a reviewer can check by hand (`When X → Y`).
- Final full loop: `npm run build` + `npm run lint` + `npm run format` +
  `npm run test`; axe at App level stays clean.
```
