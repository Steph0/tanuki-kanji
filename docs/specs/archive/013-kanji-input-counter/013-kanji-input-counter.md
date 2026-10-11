# 013 — Kanji input counter

# Why

The counter is static today. Users get no length feedback while typing.
Goal: guide length without blocking. Typing stays free past the limit.
ROI: fewer dead ends. Calmer input. More lesson starts.

# What

User-visible behavior for the landing call-to-action:

- **Live counter:** the counter moves with each keystroke. Format: `"N / 21 chars"`.
- **Gentle warning:** past the limit, one warning shows under the field. Text: `"Whoa, long one! Tanuki keeps first 21 chars."`. Submit stays on.
- **Warning only when the cut stays valid:** past the limit with a clean cut, one warning shows and submit stays on. Past the limit with a dirty cut, the error shows instead with submit off, since a submit would block anyway.
- **Empty stays silent:** blank input at or under the limit shows no message, as today. Past the limit, even blank input warns, since the counter already counts it.
- **Warning look:** past the limit, counter and warning share one warning color. At or under the limit, the calm look stays.
- **Soft cut on submit:** a warned submit keeps only the first characters for the lesson. Typing is never cut.
- **Stable rest:** charset and kanji rules, IME, focus, layout stay as today.

# Constraints

- Follow `DESIGN.md`, `AGENTS.md` (incl. Testing Strategy), and project memory conventions.
- No new `package.json` dependencies, no external CDN/`<link>`.
- The engine owns the length limit. The UI imports it read only. No local copy, no second value.
- Message order is early return on submit fate: valid first, cut errors second, length third, empty last. One message, one state, ever. The UI switches on the state kind, never on parallel flags.
- Naive length everywhere: plain string length and slice, nominal case only. No astral handling.
- Truncation is UI smoothing only. Submit applies the cut to the field, then the standard gate runs.
- `DESIGN.md` gains a warning token in the styling task. Frontmatter keys mirror `--var` 1:1 with no orphans.
- Decided with the user. Warning sentence: `"Whoa, long one! Tanuki keeps first 21 chars."`. Warning color: `#8A5E00`.

# Tasks

- [x] Task 1 — Engine owns the length limit
  - [x] Give the engine one length rule with one owner value. Technical: `services/validate.ts` exports `KANJI_INPUT_MAX_LENGTH = 21` and a `TOO_LONG: "too-long"` entry in `KanjiInputStatus`. The classifier checks early return style: empty, then length over the limit, then charset, marks, kanji. `safeParseKanjiInput` and `InvalidKanjiInput` carry the new status with no other change. `services/entrypoint.ts` and the loading error path stay as today.
  - [x] Prove with `services/validate.test.ts` through `safeParseKanjiInput` only: 21 kanji valid, 22 kanji `TOO_LONG`, long invalid charset still reports per the order above. Entrypoint rejects long input with `InvalidKanjiInput` carrying `TOO_LONG`.
  - [x] Gate: build plus lint plus format plus single-file test, then full test.

- [x] Task 2 — Live indicative counter
  - [x] Show a live count next to the label. It rises and falls with typing. No cap on typing. Technical: `SearchBar.tsx` renders `{count} / {MAX} chars` from the raw typed value with plain `.length`. Edge spaces count, since the value is not normalized here. Import `KANJI_INPUT_MAX_LENGTH` from the engine, read only. No `maxLength` attribute on the `<input>`. Counter is plain text with no live region, so screen readers stay quiet.
  - [x] Prove with `SearchBar.test.tsx`: empty shows `"0 / 21 chars"`. Typing `"森"` shows `"1 / 21 chars"`. Typing 22 kanji shows `"22 / 21 chars"`. Deleting returns to `"1 / 21 chars"`.
  - [x] Gate: build plus lint plus format plus single-file test, then full test.

- [x] Task 3 — Over-limit warning as display states, errors win
  - [x] Show one display state from a pure early return resolver. Cut nothing yet. Technical: new `kanjiInputDisplay.ts` beside the hook exports the flat `KanjiInputDisplay` (`tone` clean, empty, warning, or error plus message text or null), `resolveKanjiInputDisplay` with early return order valid, cut errors, length, empty, and `isKanjiSubmitBlocked` on the tone with its own early return. The resolver predicts the submit fate with one shared pipeline: truncate the raw value first through a UI-side `truncateKanjiInput` helper next to the resolver, then normalize, then parse. A dirty cut errors live, any raw input past the limit warns, blank at or under the limit stays silent. `useKanjiInputValidation.ts` keeps only wiring: resolve, then freeze through the generic `useIMECompositionSettledValidation`. `useSearchBar.ts` reads tone plus message from the frozen state, derives `isSearchSubmitDisabled` from `isKanjiSubmitBlocked`, and returns `kanjiInputTone` plus `kanjiInputMessage` text. `SearchBar.tsx` renders the tone straight into the field class (`field error`, `field warning`, plain `field` when silent) and the message text, and sets `aria-invalid="true"` on error tone only, `aria-describedby` on any message, keep `aria-live="polite"` with no `role` on the message. The shared error hook is renamed from `.field.invalid` to `.field.error` so the class comes straight from the tone with no mapping. Warning alone never disables submit. Counter stays live and silent during composition. Interim: a warned submit sends the full value and the engine length guard rejects it. The cut lands in Task 5.
  - [x] Prove with unit `kanjiInputDisplay.test.ts` plus `SearchBar.test.tsx`: 21 kanji clean with no warning as the nominal boundary case. Valid plus over-limit warns with submit on. Dirty cut errors live with submit off. Bad tail with clean cut warns. Back under the limit clears the warning. Short blanks stay silent. Long blanks warn with submit on but no lesson. Composing shows no flicker. Warned submit held with no lesson until the cut lands.
  - [x] Gate: build plus lint plus format plus single-file test, then full test.

- [x] Task 4 — Warning color styling (counter plus message)
  - [x] Paint counter and warning message in one new warning hue past the limit. Keep error red untouched. Technical: `DESIGN.md` frontmatter gains `warning: '#8A5E00'`, a darkened yamabuki gold. Add `--color-warning` plus `--field-glow` compatible warning glow `rgba(138, 94, 0, 0.12)` to `globals.css`, mirroring the error glow pattern. Add a warning message style and a counter `.warning` variant in `SearchBar.module.css` using `var(--color-warning)`. Add a `.field.warning` state hook with warning border, ring, glow in the same shape and place as the green ring, mirroring `.field.error`. The message tone applies exactly one state class, so error and warning never co-apply. The short warning fits the existing one line slot, so the slot stays as today. Keep card height identical across silence, warning, error at 390px and desktop.
  - [x] Prove the look with computed-style guards: `.warning` present past the limit only. Counter color equals warning message color on `surface` and on `sunk`. Warning color differs from `--color-tertiary`. Card height unchanged across silent, warning, error.
  - [x] Gate: build plus lint plus format plus single-file test, then full test.

- [x] Task 5 — UI-side gentle truncation on submit
  - [x] Turn a warned submit into a lesson from the first characters only. Never cut typing itself. Technical: reuse the UI-side `truncateKanjiInput` from `kanjiInputDisplay.ts` with a naive slice to `KANJI_INPUT_MAX_LENGTH`. `useSearchBar.ts` `handleSearchSubmit` applies the cut to the field value first (a no-op at or under the limit), then runs the standard normalize plus validate gate on the cut value. A cut that stays valid submits the cut value. Error display keeps blocking with no submit, as in Task 3. Engine files stay as in Task 1, so direct engine calls keep the hard `TOO_LONG` rule.
  - [x] Prove with unit `kanjiInputDisplay.test.ts` plus `SearchBar.test.tsx`: over-limit valid submit fires once with exactly the first 21 characters. Over-limit invalid submit stays blocked with its live error and no submit. Update the Task 3 interim assertion to the truncated value. Engine bypass with long input still rejects `TOO_LONG`.
  - [x] Gate: build plus lint plus format plus single-file test, then full test.

# Acceptance

- Empty shows `"0 / 21 chars"`, silent, submit off. Typing `"森"` shows `"1 / 21 chars"`. Typing 21 kanji is clean. Typing 22 kanji shows `"22 / 21 chars"` plus the warning. Typing never blocks.
- Valid plus over-limit: warning in warning color, counter in warning color, submit on. Dirty cut plus over-limit: error live, submit off, no lesson. Short blanks: silent. Long blanks: warning with submit on but no lesson. Back under the limit: warning and warning color gone.
- No card jump across silent, warning, error. Axe at App level stays clean.
- Over-limit valid submit fires once with exactly the first 21 characters. Direct engine call with long input rejects with the length status.
- Each task green: `npm run build` plus `npm run lint` plus `npm run format` plus `npm run test`. Axe at App level stays clean.
