# 013 — Kanji input counter

# Why

The counter is static today. Users get no length feedback while typing.
Goal: guide length without blocking. Typing stays free past the limit.
ROI: fewer dead ends. Calmer input. More lesson starts.

# What

User-visible behavior for the landing call-to-action:

- **Live counter:** the counter moves with each keystroke. Format: `"N / 21 chars"`.
- **Gentle warning:** past the limit, one warning shows under the field. Text: `"Whoa, long one! Tanuki keeps first 21 chars."`. Submit stays on.
- **Warning first:** when long, the warning shows even if other errors lurk. They surface on submit, after the cut.
- **Empty stays silent:** blank input shows no message, as today.
- **Warning look:** past the limit, counter and warning share one warning color. At or under the limit, the calm look stays.
- **Soft cut on submit:** a warned submit keeps only the first characters for the lesson. Typing is never cut.
- **Stable rest:** charset and kanji rules, IME, focus, layout stay as today.

# Constraints

- Follow `DESIGN.md`, `AGENTS.md` (incl. Testing Strategy), and project memory conventions.
- No new `package.json` dependencies, no external CDN/`<link>`.
- The engine owns the length limit. The UI imports it read only. No local copy, no second value.
- Message order is early return: silence first, warning second, error last. One message, one state class, ever.
- Naive length everywhere: plain string length and slice, nominal case only. No astral handling.
- Truncation is UI smoothing only. Submit applies the cut to the field, then the standard gate runs.
- `DESIGN.md` gains a warning token in the styling task. Frontmatter keys mirror `--var` 1:1 with no orphans.
- Decided with the user. Warning sentence: `"Whoa, long one! Tanuki keeps first 21 chars."`. Warning color: `#8A5E00`.

# Tasks

- [x] Task 1 — Engine owns the length limit
  - [x] Give the engine one length rule with one owner value. Technical: `services/validate.ts` exports `KANJI_INPUT_MAX_LENGTH = 21` and a `TOO_LONG: "too-long"` entry in `KanjiInputStatus`. The classifier checks early return style: empty, then length over the limit, then charset, marks, kanji. `safeParseKanjiInput` and `InvalidKanjiInput` carry the new status with no other change. `services/entrypoint.ts` and the loading error path stay as today.
  - [x] Prove with `services/validate.test.ts` through `safeParseKanjiInput` only: 21 kanji valid, 22 kanji `TOO_LONG`, long invalid charset still reports per the order above. Entrypoint rejects long input with `InvalidKanjiInput` carrying `TOO_LONG`.
  - [x] Gate: build plus lint plus format plus single-file test, then full test.

- [ ] Task 2 — Live indicative counter
  - [ ] Show a live count next to the label. It rises and falls with typing. No cap on typing. Technical: `SearchBar.tsx` renders `{count} / {MAX} chars` from the raw typed value with plain `.length`. Edge spaces count, since the value is not normalized here. Import `KANJI_INPUT_MAX_LENGTH` from the engine, read only. No `maxLength` attribute on the `<input>`. Counter is plain text with no live region, so screen readers stay quiet.
  - [ ] Prove with `SearchBar.test.tsx`: empty shows `"0 / 21 chars"`. Typing `"森"` shows `"1 / 21 chars"`. Typing 22 kanji shows `"22 / 21 chars"`. Deleting returns to `"1 / 21 chars"`.
  - [ ] Gate: build plus lint plus format plus single-file test, then full test.

- [ ] Task 3 — Over-limit warning, warning first, no cut yet
  - [ ] Warn gently in the existing message slot past the limit. Cut nothing yet. Warning beats error while long. Technical: `useKanjiInputValidation.ts` derives `isOverLimit` from raw typed length over the engine limit, same count as the counter. Early return: normalized empty stays silent, over-limit shows the warning, else the existing error mapping. So 22 spaces stay silent and long invalid input shows the warning. Warning copy lives in a SearchBar-local constant: `OVER_LIMIT_WARNING_MESSAGE = "Whoa, long one! Tanuki keeps first 21 chars."`. Set `aria-invalid="true"` on error only, `aria-describedby` on any message, keep `aria-live="polite"` with no `role` on the message, so the warning announces once on appearance. Over-limit alone never disables submit. Freeze warning evaluation while composing, like validation. Counter stays live during composition. Interim: submit sends the full value and the engine length guard rejects it. The cut lands in Task 5.
  - [ ] Prove with `SearchBar.test.tsx`: 21 kanji clean with no warning as the nominal boundary case. Valid plus over-limit shows the warning with submit on. Invalid plus over-limit shows the warning live, never the error. Back under the limit clears the warning. 22 spaces stay silent. Composing shows no flicker.
  - [ ] Gate: build plus lint plus format plus single-file test, then full test.

- [ ] Task 4 — Warning color styling (counter plus message)
  - [ ] Paint counter and warning message in one new warning hue past the limit. Keep error red untouched. Technical: `DESIGN.md` frontmatter gains `warning: '#8A5E00'`, a darkened yamabuki gold. Add `--color-warning` plus `--field-glow` compatible warning glow `rgba(138, 94, 0, 0.12)` to `globals.css`, mirroring the error glow pattern. Add a warning message style and a counter `.overLimit` variant in `SearchBar.module.css` using `var(--color-warning)`. Add a `.field.warning` state hook with warning border, ring, glow in the same shape and place as the green ring. The early return from Task 3 applies exactly one state class, so error and warning never co-apply. The short warning fits the existing one line slot, so the slot stays as today. Keep card height identical across silence, warning, error at 390px and desktop.
  - [ ] Prove the look with computed-style guards: `.overLimit` present past the limit only. Counter color equals warning message color on `surface` and on `sunk`. Warning color differs from `--color-tertiary`. Card height unchanged across silent, warning, error.
  - [ ] Gate: build plus lint plus format plus single-file test, then full test.

- [ ] Task 5 — UI-side gentle truncation on submit
  - [ ] Turn a warned submit into a lesson from the first characters only. Never cut typing itself. Technical: new pure `services/truncate.ts` exporting `truncateKanjiInput` with a naive slice to `KANJI_INPUT_MAX_LENGTH`. `useSearchBar.ts` `handleSearchSubmit` applies the cut to the field value first when over-limit, then runs the standard normalize plus validate gate on the cut value. A cut that stays valid submits the cut value. A cut that turns invalid blocks and the live rules now show the error, since the field is no longer over-limit. Engine files stay as in Task 1, so direct engine calls keep the hard `TOO_LONG` rule.
  - [ ] Prove with unit `services/truncate.test.ts` plus `SearchBar.test.tsx`: over-limit valid submit fires once with exactly the first 21 characters. Over-limit invalid submit shows the error after the cut with no submit. Update the Task 3 interim assertion to the truncated value. Engine bypass with long input still rejects `TOO_LONG`.
  - [ ] Gate: build plus lint plus format plus single-file test, then full test.

# Acceptance

- Empty shows `"0 / 21 chars"`, silent, submit off. Typing `"森"` shows `"1 / 21 chars"`. Typing 21 kanji is clean. Typing 22 kanji shows `"22 / 21 chars"` plus the warning. Typing never blocks.
- Valid plus over-limit: warning in warning color, counter in warning color, submit on. Invalid plus over-limit: warning live, error after submit with no lesson. 22 spaces: silent. Back under the limit: warning and warning color gone.
- No card jump across silent, warning, error. Axe at App level stays clean.
- Over-limit valid submit fires once with exactly the first 21 characters. Direct engine call with long input rejects with the length status.
- Each task green: `npm run build` plus `npm run lint` plus `npm run format` plus `npm run test`. Axe at App level stays clean.
