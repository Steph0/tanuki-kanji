# 009 — Kanji Submission Skeleton

# Why

Landing page is static: input is `readOnly`, submit does nothing, no routing exists.
We need a minimal end-to-end skeleton proving the app shape:

- Enter characters on landing,
- Run an "in-browser" service asynchronously behind a loading page
- Show a result page

# What

One submission flow across three screens, each reachable by web address:

- Landing page: be able to type characters (or nothing at all) and click the send button to start.
  Sending is click-only for now.
- New loading page: a waiting screen (navigation + "Loading..." message) shown while the
  kanji lesson is prepared in the background (about a second in this skeleton).
- New result page: the page where the user ends once the lesson is ready.

Flow rules:

- Opening the loading or result screen directly returns to landing.
- Nothing is saved between visits
- If lesson preparation fails, the result screen shows a plain error text.

# Constraints

- User authorizes installing `preact-iso` (exception to the no-new-deps rule for
  009 only). No other new `package.json` dependencies, no external CDN/`<link>`.
- New routing must be `preact-iso`.

# Tasks (each task ships its own tests; no separate testing task)

- [x] Task 1 — Service entrypoint
  - [x] `src/services/types.ts` with `TanukiKanjiEngine` type.
  - [x] `src/services/entrypoint.ts` with fake `runTanukiKanjiLesson` (~1s via
        `globalThis.setTimeout` + static `"kanji lesson"` text).
  - [x] Test with the code: `src/services/entrypoint.test.ts` (`*.test.ts` = pure
        logic) with fake timers (`vi.useFakeTimers()` + `advanceTimersByTime`,
        no real 1s wait): resolves `"kanji lesson"` after advancing 1s, still
        pending before that.
  - [x] Gate — run the testing loop.
  - [ ] Note — `App` state/props land in their first consumer task (Tasks 2–4),
        not here: `noUnusedLocals` is on, so every task must keep the loop green.

- [ ] Task 2 — `preact-iso` router wiring
  - [ ]  `npm install preact-iso --save` (authorized exception to install this package); `App` wraps tree in `LocationProvider`
        + `Router` with routes `/`, `/loading`, `/result` and `default` 404 to `/`.
        `/loading` and `/result` render temporary placeholders until next spec tasks
        replace them with the real pages.
  - [ ] Navigation via `useLocation().route(url, replace?)`: submit uses push to
        `/loading`; guards and post-engine nav use `replace` (no `/loading` loop
        on Back). Move focus to `main` + reset scroll on route change.
  - [ ] Guards: when `input`/`result` state is `null`, `/loading`/`/result` to
        `replace("/")`. `App` owns the `input`/`result` state here
        (`useState<string | null>`, in-memory only, read by the guards;
        setters get wired in Tasks 3–4).
  - [ ] Only `App` calls `route()`; pages stay router-free and receive callbacks
        via props (testable without a provider).
  - [ ] Tests with the code: guard redirects at router
        level — back/forward, direct `/loading`, direct `/result`, unknown path,
        all with `null` state to `/`; no history pollution (reset URL to `/`
        first in each test — browser-mode shares real `window.location`);
        update `src/App.test.tsx` for the router shell (discovery-order test
        renders at `/` after reset). Guard redirects are tested once here —
        Tasks 4–5 test page behavior with valid state only.
  - [ ] Gate — run the testing loop.

- [ ] Task 3 — Landing submit wiring
  - [ ] `SearchBar`: remove `readOnly`, editable input with internal draft
        `useState`, click-only submit calling `onSubmit(draft)` (no Enter
        binding), always enabled (empty allowed, no validation). Counter stays
        static (`0 / 21 chars`, untouched — full call-to-action review later).
  - [ ] `App` submit handler: `setInput(text)` to `route("/loading")` (push) —
        wires the `setInput` setter here.
  - [ ] Tests with the code: update `SearchBar.test.tsx` for the new props
        (existing prop-less renders break); keep label/placeholder,
        submit-button, counter, and focus-ring guard tests green; add
        `onSubmit`-receives-typed-text test plus App-level
        type + click submit to navigates to `/loading` test.
  - [ ] Gate — run the testing loop.

- [ ] Task 4 — Loading page
  - [ ] New `LoadingPage({ input, engine, onDone })` in
        `src/components/LoadingPage/` (repo convention, colocated
        `LoadingPage.test.tsx`): `Navbar` + `"Loading..."` with
        `aria-live="polite"` + `aria-busy="true"`.
  - [ ] `useEffect` on mount: run `engine(input)` once (guard ref against double
        invoke, cancellation flag on unmount to ignore late resolve after Back),
        success to `onDone(result)`, rejection to `onDone("error")`.
        Page is router-free: `App` gains the optional `engine` prop here
        (default `runTanukiKanjiLesson`), and `App`'s `onDone` calls `setResult`
        then `route("/result", true)`.
  - [ ] Tests with the code (mock `TanukiKanjiEngine): `/loading` shows;
        `onDone` receives engine text on resolve, `"error"` on rejection
        (router-free, no provider needed); App-level test: resolve to stores
        result and lands on `/result`.
  - [ ] Gate — run the testing loop.

- [ ] Task 5 — Result page
  - [ ] New `ResultPage({ result })` in `src/components/ResultPage/` (repo convention,
        colocated `ResultPage.test.tsx`): `Navbar` + output text only
        (`aria-live="polite"`).
  - [ ] Tests with the code: `/result` shows engine text; extend axe coverage to
        all three routes by rendering `App` at the URL with valid state
        (`/` fresh, `/loading` with submitted input, `/result` with stored
        result) and running `axe.run(document.body)` at each viewport
        (mobile `390x844`, rotated `844x390`, desktop `1280x800`) — 9 scans.
  - [ ] Gate — run the testing loop.

# Acceptance

- Manual testing : Type (or leave empty) to click submit to `/loading` shows `Navbar` + `"Loading..."`
  for ~1s (fake) to `/result` shows `Navbar` + static lesson text.
- Engine failure surfaces static `"error"` text on `/result` (integration test).
- Direct `/loading`, `/result`, unknown path, or refresh mid-flow
  redirects to `/` (integration tests in Task 2); confirm manually.
- Only new dependency is authorized `preact-iso`; testing loop green;
  mobile-first + a11y kept (axe clean on all three routes).
