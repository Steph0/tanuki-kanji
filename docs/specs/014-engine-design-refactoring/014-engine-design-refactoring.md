# 014 - Engine clean architecture foundation

# Why

The input checks for the kanji search live next to the screens that use
them. Each new lesson feature would edit the same shared helpers and could
break typing feedback or lesson start by accident. This spec rebuilds those
checks as a layered engine with one stable place the screens read from, so
later features land inside without touching the screens.

# What

The shop stays open while the engine room is rebuilt. This is a technical refactoring, no
functional changes.

Behind the scenes, the scattered checks become one new layered engine with a
single reading place for the screens, and the old paths of engine disappear.

# Constraints

- Follow `DESIGN.md`, `AGENTS.md` (incl. Testing Strategy), and project memory conventions.
- No new `package.json` dependencies, no external CDN/`<link>`.
- Tasks run in the given order. Strangler: new path beside the old with re-exports green, screens switch once (Task 7), legacy deleted last (Task 8).
- Granted bypass: this spec names files and symbols early to keep the small steps unambiguous, and review may rename without breaking intent.
- Hexagonal direction: domain never imports outward; pages import only the controller file. Controller plus entrypoint are inbound adapters and may import inward.
- Deliberate non-goals: no CQRS, no event bus, no aggregates or repositories, no use case layer. The single value object needs none of that yet.
- Out of scope: lesson generation content, new statuses or new rules, infrastructure work (`infrastructure/` stays a `.gitkeep` placeholder), any behavior or copy change.

# Tasks

- [x] Task 1 - Input normalization becoming part of input parsing
  - [x] Pasted text with extra spaces around it counts like the trimmed
        word, and spaces-only still counts as empty. Technical:
        `src/services/validate.ts` owns the single check and opens by
        calling `normalizeKanjiInput` from `src/services/normalize.ts`; the
        `NormalizedKanjiInput` brand stays inside that step and
        `src/services/normalize.ts` itself is untouched.
  - [x] The lesson start and both search files use the single check with no
        behavior change. Technical: simplify `src/services/entrypoint.ts`,
        `src/pages/LandingPage/SearchBar/useSearchBar.ts`,
        `src/pages/LandingPage/SearchBar/kanjiInputDisplay.ts`; drop the now
        unused `normalizeKanjiInput` imports.
  - [x] Tests move with the code. Technical: update
        `src/services/validate.test.ts` to feed raw text into the single
        check and keep every existing case, with padded input behaving like
        trimmed input and spaces-only staying empty;
        `src/services/normalize.test.ts` untouched; entrypoint plus SearchBar
        suites stay green.
  - [x] Gate: build plus lint plus format plus `validate.test.ts` single-file test, then full test.

- [x] Task 2 - Empty engine layer folders exist
  - [x] Later moves land in a visible home with nothing wired yet.
        Technical: create `src/services/engine/controller/`,
        `src/services/engine/domain/`,
        `src/services/engine/infrastructure/`, each holding a `.gitkeep` so
        the structure stages; `infrastructure/` keeps only its `.gitkeep`
        as an intentional placeholder for a later spec; no code files,
        no imports, no behavior change. Naming from here on: one
        kebab-case folder per world, Uppercase files for value objects
        and vocabulary, lowercase for domain services.
  - [x] Gate: build plus lint plus format plus full test.

- [x] Task 3 - Normalizing in engine lives in the domain
  - [x] Pasted text is cleaned by the domain, not by callers. Technical:
        new `src/services/engine/domain/kanji-input/normalizeKanjiInput.ts`
        holding the pure idempotent domain service `normalizeKanjiInput`
        returning the branded `NormalizedKanjiInput`;
        `src/services/normalize.ts` becomes a one-line re-export; remove the
        now-unneeded `domain/.gitkeep`; no caller changes.
  - [x] Prove the move with relocated tests. Technical: move
        `src/services/normalize.test.ts` to
        `src/services/engine/domain/kanji-input/normalizeKanjiInput.test.ts`
        targeting the domain path, with trimming, spaces-only, inner spaces
        kept, and double application stable; no duplicate suite for the
        re-export.
  - [x] Gate: build plus lint plus format plus `normalizeKanjiInput.test.ts` single-file test, then full test.

- [x] Task 4 - Validation logic lives in the domain
  - [x] The validation vocabulary belongs to the validation logic.
        Technical: new
        `src/services/engine/domain/kanji-input/validation/KanjiInputValidationStatus.ts`
        holding the status codes with keys
        plus values frozen (`EMPTY: "empty"`, `VALID: "valid"`,
        `INVALID_CHARACTERS: "invalid-characters"`,
        `MISSING_KANJI: "missing-kanji"`, `TOO_LONG: "too-long"`)
        so only the container name and address move; new
        `src/services/engine/domain/kanji-input/validation/KanjiInputValidationPolicy.ts`
        holding the `KANJI_INPUT_MAX_LENGTH` rule (limit `21`) as the shared
        policy both the classifier and outside consumers read;
        `src/services/validate.ts` re-exports them; no caller changes.
  - [x] The checks run as a pure idempotent domain service on cleaned text.
        Technical: new
        `src/services/engine/domain/kanji-input/validation/validateKanjiInput.ts`
        holding `validateKanjiInput` plus the named predicates with patterns
        and order unchanged; `src/services/validate.ts` keeps composing its
        single check from the two domain services and keeps its result
        shape, brand, plus boundary error locally until Task 8; no caller
        changes.
  - [x] Prove the move with the code. Technical: new colocated unit
        `src/services/engine/domain/kanji-input/validation/validateKanjiInput.test.ts`
        feeding cleaned text built through the Task 3 service with no casts
        into the classifier across every status via case arrays duplicated
        in this suite (no shared fixture file); the legacy
        `src/services/validate.test.ts` stays as written and green through
        the re-exports.
  - [x] Gate: build plus lint plus format plus `validateKanjiInput.test.ts` single-file test, then full test.

- [x] Task 5 - KanjiInput value object answers the familiar result
  - [x] Only valid text becomes a KanjiInput object, and every answer carries
        its status. Technical: new
        `src/services/engine/domain/kanji-input/KanjiInput.ts` holding the
        `KanjiInput` value object with a private constructor plus the static
        `create` factory taking raw text and referencing `KanjiInput`
        directly, never `this`; the factory cleans through the Task 3
        domain service, checks through the Task 4 domain service, and
        answers the Result pattern shaped like the legacy parse result with
        the instance as value only when valid; it never throws; the instance
        exposes its proven text through a readonly value.
  - [x] Prove the answers with the code. Technical: new colocated unit
        `src/services/engine/domain/kanji-input/KanjiInput.test.ts` through
        `create` only, covering valid text handing back an instance with its
        proven text, padded input behaving like trimmed input, each failing
        status asserted with exact shape and no value key, and no
        construction test since the private constructor is the guarantee;
        no caller changes in this task.
  - [x] Gate: build plus lint plus format plus `KanjiInput.test.ts` single-file test, then full test.

- [ ] Task 6 - Narrow consumer calls with a public surface
  - [ ] Screens will talk to the controller layer that never hard-codes the rule.
        Technical: new
        `src/services/engine/controller/parseKanjiInputController.ts`
        holding the public surface alongside the controller, with
        `KANJI_INPUT_VALIDATION_STATUS` plus type
        `KanjiInputValidationStatus` aliasing the domain codes,
        `ParseKanjiInputResponse` carrying a plain string value, and the
        `KANJI_INPUT_MAX_LENGTH` re-export from the domain, all by same
        reference (no copies) so `===` keeps working; the same file
        holds the factory `createParseKanjiInputController` receiving the
        creator by injection defaulting to
        `(raw: string) => KanjiInput.create(raw)` with no use case layer
        in between, so screens create once
        at module scope with no args and call the returned controller
        per event. This is the first and only public API the UI will use.
  - [ ] Screen shapes and rule shapes never mix. Technical: the same file
        holds the dumb `mapToParseKanjiInputResponse` mapper with an
        exhaustive status switch plus a `never` check from the domain
        answer into the public response plus the instance to plain string
        unwrap; no wording and no logic live in the mapper; remove the
        now-unneeded `controller/.gitkeep`.
  - [ ] Prove faithful delegation with the code. Technical: new colocated
        unit `src/services/engine/controller/parseKanjiInputController.test.ts`
        through the public factory only, asserting the public statuses across
        every case via case arrays duplicated in this suite (no shared
        fixture file) covering valid, padded, empty, foreign
        characters, kana-only, and over-limit built from the public limit,
        with exact failure shapes and no value key; plus one stub creator
        case proving the injected creator is the one called.
  - [ ] Gate: build plus lint plus format plus `parseKanjiInputController.test.ts` single-file test, then full test.

- [ ] Task 7 - Search screens use the controller
  - [ ] Typing feedback, the submit gate, and the counter read from the
        controller file, and this is the only time the screens move.
        Technical: rewire
        `src/pages/LandingPage/SearchBar/useSearchBar.ts` and
        `src/pages/LandingPage/SearchBar/kanjiInputDisplay.ts` to the Task 6
        module-scope controller plus the public statuses;
        `truncateKanjiInput` stays where it is and still runs before the
        controller call so the warning path is untouched and the engine
        `TOO_LONG` stays unreachable on that path by design; move the limit
        imports in those files plus `SearchBar.tsx` to the controller file; no
        legacy import remains in the three files and no file imports the
        domain directly;
        `src/services/entrypoint.ts` keeps its direct check and
        `useLoadingPage.ts` keeps `InvalidKanjiInput` from the legacy path
        until Task 8.
  - [ ] Prove the switch with unchanged screens. Technical: no UI test file
        changes; `kanjiInputDisplay.test.ts` plus `SearchBar.test.tsx` stay
        green as written; the Task 6 suite covers the rewired path.
  - [ ] Gate: build plus lint plus format plus `parseKanjiInputController.test.ts`
        then `kanjiInputDisplay.test.ts` then `SearchBar.test.tsx` single-file
        tests, then full test.

- [ ] Task 8 - Legacy engine files disappear
  - [ ] No import path points at the legacy files anymore. Technical: delete
        `src/services/validate.ts`, `src/services/normalize.ts`, plus
        `src/services/validate.test.ts`; `src/services/entrypoint.ts` (an
        adapter, so domain import is allowed) builds
        its lesson from the `KanjiInput.create` answer, unwraps the proven
        text, and throws the boundary error unless valid; the boundary error
        moves with name plus message plus shape unchanged into
        `src/services/engine/domain/kanji-input/validation/InvalidKanjiInput.ts`
        and the controller file re-exports it so pages never import the
        domain; `useLoadingPage.ts` catches the class via the controller
        file; the search files stay untouched since they already read the
        controller file; move the error import in
        `src/services/entrypoint.test.ts` plus `useLoadingPage.test.tsx` to
        the controller file, and the status plus limit imports in those
        suites to the controller file as well.
  - [ ] Prove the removal with updated suites. Technical: entrypoint plus
        loading suites assert the boundary error path with name plus status;
        every SearchBar suite stays green as written; full text search shows
        no import of the deleted paths and no `pages` import of the domain.
  - [ ] Gate: build plus lint plus format plus `entrypoint.test.ts` then
        `useLoadingPage.test.tsx` single-file tests, then full test.

# Acceptance

- When a user submits a word with surrounding spaces, the lesson starts for
  the trimmed word.
- When the field holds only spaces, no message shows and submit stays
  disabled with no lesson.
- When the field holds foreign characters, the red field plus disabled
  submit plus `"Only Kanji, hiragana and katakana characters are allowed"`
  show, and submit starts no lesson.
- When the field holds kana alone, `"Enter at least one kanji."` shows with
  disabled submit.
- When the field holds an overlong word, `"Whoa, long one! Tanuki keeps first 21 chars."` shows with submit enabled.
- Final full loop: `npm run build` plus `npm run lint` plus `npm run format`
  plus `npm run test`; axe at App level stays clean.
