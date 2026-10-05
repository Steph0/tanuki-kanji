# 011 — Kanji input validation

# Why

The landing input currently accepts anything. Before the app prepares a lesson,
the input must be clean Japanese only: kanji, hiragana, katakana. Anything else
is rejected with a clear message, and rejected input never reaches the lesson.

# What

User-visible behavior for the landing call-to-action:

- **Japanese letters only, one word, at least one kanji:** kanji, hiragana,
  katakana (including the long-vowel mark `ー` and `々` as in `人々`). Latin
  letters, numbers, symbols, punctuation, and spaces between words are
  rejected — and kana-only input is rejected too, since this is a kanji
  lesson: `"Enter at least one kanji."`
- **Forgiving edges:** extra spaces before/after the word are trimmed silently;
  spaces-only counts as empty.
- **Empty input:** the submit stays disabled and nothing else happens — silent,
  no error, no message, ever.
- **Invalid input:** the submit stays disabled, the field border turns red, and
  a message appears under the field in the same red:
  `"Only Kanji, hiragana and katakana characters are allowed"`.
- **Responsive:** every keystroke is checked instantly — no flicker while
  typing fast or while choosing characters in the Japanese keyboard (IME).
  Pressing submit always checks instantly, even mid-typing, and a blocked
  submit shows the message right away.
- **No surprises elsewhere:** the character counter stays as-is; typing a valid
  word keeps the current green look; rejected input (button or Enter) never
  starts a lesson.
- **Enter key:** the Enter / mobile "go" key behaves exactly like the submit button.

# Constraints

- Follow `DESIGN.md`, `AGENTS.md` (incl. Testing Strategy), and project memory conventions.
- No new `package.json` dependencies, no external CDN/`<link>`.
- Engine is a linear pipeline (no state machine): `normalize -> validate ->
  generate`, coordinated by the single async `runTanukiKanjiLesson` entrypoint.
- Single source of truth: checks live in the engine; UI imports them, no duplication.
- Out of scope: per-step cancellation, observability, counter behavior.

# Tasks

- [x] Task 1 — Normalize + engine plug
  - [x] Clean the raw input before anything else: edge spaces are trimmed
        silently, spaces-only counts as empty, spaces inside the word are kept
        so the validator can reject them. Technical: `services/normalize.ts`
        with branded `NormalizedKanjiInput` + `normalizeKanjiInput(raw:
        string)`; static, idempotent, pure, no throw.
  - [x] The lesson always starts from cleaned input, so padded typing behaves
        exactly like trimmed typing. Technical: `services/entrypoint.ts`
        normalizes first, then the async work (fake wait today).
  - [x] Prove the cleaning with `services/normalize.test.ts`: `" 森 "` → `"森"`,
        `"   "` → `""`, `"森 森"` kept as-is, `normalize(normalize(x))` stable;
        entrypoint with `" 森 "` resolves like `"森"`.
  - [x] Gate — build + lint + format + single-file test, then full test.

- [x] Task 2 — Validator + engine guard
  - [x] Only real Japanese single words get through: hiragana, katakana with
        long-vowel mark, kanji core plus `々`; latin, numbers, symbols,
        punctuation, and inner spaces are out. Technical:
        `services/validate.ts` with `JAPANESE_WORD_PATTERN =
        /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3005]+$/u` plus named
        predicates (`isEmptyKanjiInput`, `hasOnlyAllowedCharacters`,
        `hasExcludedIterationMarks`, `containsKanji`) composing the private
        classifier — no inline regex or comparison in the decision.
  - [x] The archaic iteration marks are rejected even though they hide inside
        the kana blocks. Technical: `EXCLUDED_ITERATION_MARKS_PATTERN =
        /[\u309D\u309E\u30FD\u30FE]/u` (`ゝ`/`ゞ`/`ヽ`/`ヾ` sit inside the kana
        ranges, so ranges alone let them through); CJK extensions/compat and
        half-width katakana never match the word pattern at all.
  - [x] Kana-only input is rejected too, since this is a kanji lesson.
        Technical: `KANJI_PATTERN = /[\u4E00-\u9FFF]/u` (`々` allowed but not
        counted as kanji) behind `containsKanji`.
  - [x] Every outcome has a code the UI and the error can share, with no
        string literals scattered at comparison sites. Technical: statuses are
        an `as const` object (`KanjiInputStatus.VALID`, …) doubling as the
        union type — no `enum`. The engine carries codes only, never messages.
  - [x] Callers get proof, not a string to re-check. Technical:
        `safeParseKanjiInput` is the only classification the module exports —
        Zod-style `KanjiInputParseResult` (`{ status: VALID, value:
        ValidKanjiInput } | { status: error }`), the single sanctioned place
        where the brand is bestowed — no `as` anywhere else. The UI (Task 4)
        uses it too, never a second classifier. Static, idempotent, pure, no
        throw.
  - [x] The rejection itself carries the reason across the engine boundary.
        Technical: `InvalidKanjiInput` in `services/validate.ts`, plain
        `Error` subclass, `name` set, carrying only the failing `status`,
        message always the short code.
  - [x] Rejected input never starts a lesson, even if the UI is bypassed.
        Technical: `services/entrypoint.ts` becomes `normalize` →
        `safeParseKanjiInput` (throw `InvalidKanjiInput` with the failing
        `status` attached unless `KanjiInputStatus.VALID`, then continue with
        the proven `value`) → fake wait.
  - [x] The failure reason travels with the rejection, so later layers never
        re-derive it. Technical: `InvalidKanjiInput.status:
        Exclude<KanjiInputStatus, typeof KanjiInputStatus.VALID>`. Words
        for the user live UI-side (Task 4), never in the engine.
  - [x] A bypass is logged visibly instead of failing silently. Technical:
        `useLoadingPage.ts` catches `InvalidKanjiInput` → existing
        `console.warn` style (`"Invalid kanji input reached the lesson
        engine."`) then the current `onDone("error")` path.
  - [x] The lesson output names the treated word it was built from, so `" 森 "`
        yields a lesson for `森`. Technical: `services/entrypoint.ts` resolves
        `` `kanji lesson: ${normalizedKanjiInput}` `` instead of the static
        string; update the tests asserting the real engine output
        (`services/entrypoint.test.ts`, `src/App.axe.test.tsx` waiting on the
        text).
  - [x] Prove the rejections with `services/validate.test.ts` (through the
        public `safeParseKanjiInput` only): valid `森`,
        `食べる`, `人々`; invalid `abc`, `123`, `森!`, `a>`, `a/b`, `a;b`, `a'b`,
        `a"b"`, `"<script>"`, `"alert('x')"`, `""`, `"   "`, `"森 森"`,
        `"、。 "`, `ゝゞヽヾ`, kana-only `ひらがな`/`カタカナ`/`ラーメン`,
        `々`-only; entrypoint rejects invalid with `InvalidKanjiInput` (name +
        `status` asserted); loading hook on `InvalidKanjiInput` warns and calls
        `onDone("error")`.
  - [x] Gate — build + lint + format + single-file test, then full test.

- [x] Task 3 — SearchBar semantic form shell (structure first, no validation yet)
  - [x] Give mouse, keyboard, and mobile keyboards one single submit path, with
        no double firing. Technical: `SearchBar.tsx` CTA row becomes `<form
        onSubmit={preventDefault + fire}>`, button `type="submit"`, button
        `onClick` removed. Behavior otherwise unchanged (raw value, no gates).
  - [x] Half-written text from the Japanese keyboard never submits. Technical:
        Enter / "go" fires the same path, except while `isComposing` (tracked
        in a ref via native `compositionstart`/`compositionend` listeners —
        Preact maps `onCompositionStart` to the never-firing
        `"CompositionStart"`).
  - [x] Prove the path with tests: click fires once with the typed value; Enter
        fires; composition Enter ignored; empty field behaves exactly as today.
  - [x] Gate — build + lint + format + single-file test, then full test.

- [ ] Task 4 — SearchBar validation logic (gates through the form path)
  - [x] Step 1 — Sync status: the field always shows its current state — silent
        when empty, a charset message for foreign characters, a kanji message
        for kana-only, enabled when valid. Technical: the only classifier is
        the engine's `safeParseKanjiInput` (no local copy, no second
        classifier); words live UI-side (SearchBar-local message constants,
        `EMPTY` → silent); status derived synchronously on each change; empty/invalid → `disabled`.
        Tests: each status renders its message/disabled state; empty silent.
  - [ ] Step 2 — IME: half-composed Japanese text is never judged and never
        flickers. Technical: `isComposing` skips validation, `compositionend`
        validates.
        Tests: composing shows no flicker; compositionend settles validity.
  - [ ] Step 3 — Submit gate: submit double-checks at the last moment, so even
        a lightning-fast click on a stale display can't sneak bad input
        through — and the user is told why it was blocked. Technical: form
        `onSubmit` re-validates synchronously first; valid fires the normalized
        value, invalid shows its message immediately (no `onSubmit`).
        Tests: valid fires `" 森 "` as `"森"`; invalid blocks click and Enter
        and shows the message; empty blocks silently.
  - [ ] Step 4 — A11y: screen readers announce each state change politely and
        label Japanese text correctly. Technical: `aria-invalid="true"` only on
        char-error, `aria-describedby` only when a message is present, message
        `<p>` with `aria-live="polite"` (no `role="alert"`), native `disabled`,
        `lang="ja"` on the `<input>`.
        Tests: attributes present/absent per state.
  - [ ] Gate — build + lint + format + single-file test, then full test.

- [ ] Task 5 — Invalid styling (no layout shift, red wins, disabled look)
  - [ ] Make the invalid state unmistakable but calm: red field, red message in
        the same red, layout never jumps, submit looks clearly untouchable while
        staying in the green family. Technical: `SearchBar.module.css` (tokens
        via `var(--...)` only): `.invalid` on `fieldRow` (`--color-tertiary`
        border, beats `:focus-within`/`.field` single ring, no matcha glow);
        message class (`--color-tertiary`, `body-sm`); reserved error slot sized
        so card height is identical with and without the message at 390px and
        desktop; `submitButton:disabled` via tokens only, target size kept.
  - [ ] Prove the look with computed-style guards: `.invalid` class present,
        border color equals message color, card height unchanged when the
        message appears, disabled attr present.
  - [ ] Gate — build + lint + format + single-file test, then full test.

# Acceptance

- Typing `hello`, `123`, `森!`, `森 森` → red border + red char message +
  disabled submit, no `onSubmit` (click or Enter); typing `ひらがな` or
  `ラーメン` alone → disabled + `"Enter at least one kanji."`; every keystroke
  shows instantly, and a blocked submit shows the message right away.
- `" 森 "` → accepted as `森`; `"   "` → empty-disabled, silent, no submit.
- Empty load → no error, disabled green submit, no message ever.
- `森`, `食べる`, `人々` → green, submit fires via
  click (exactly once) and Enter with normalized value.
- Engine called directly with invalid rejects `InvalidKanjiInput`
  (`"input validation failed"`); loading flow warns and shows the error path.
- IME composing shows no flicker, Enter mid-composition never submits.
- No card jump when messages appear; counter stays static `0 / 21 chars`.
- Each task green (`npm run build` + `npm run lint` + `npm run format` +
  `npm run test`); axe at App level stays clean.
