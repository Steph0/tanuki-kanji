# 016 - OpenRouter OAuth

# Why

Ease learners onboarding + app security by implementing OpenRouter OAuth flow.
Asking them to copy an API key into the app is clumsy and easy to get wrong. OpenRouter
offers a sign-in handshake that returns a key, so the app can get one in a few
clicks without ever shipping a shared key. The app also explains that
disconnecting forgets the key locally, while the key remains revocable in the
learner's OpenRouter account.

# What

- The navbar shows a settings control: the `settings_alert` mark while no
  OpenRouter account is connected, and the `settings_account_box` mark while
  one is.
- The control opens a modal centered over the app.
- While disconnected, the modal explains the offer and shows one main action:
  "Connect to OpenRouter". Any connection error appears directly under that
  action.
- After the engine prepares the sign-in, the UI sends the browser to OpenRouter
  itself; the learner approves the app and returns to the app without handling a
  sign-in link.
- While the engine prepares the sign-in and the UI starts the transition, the
  main action is disabled and the modal stays open. If the engine refuses or the
  browser transition throws, the action re-enables and the modal shows the
  connection error.
- While the app finishes the sign-in, the modal shows a connecting state framed
  by the same animated rings as the loading screen, titled "Connecting to
  OpenRouter", with the body "Finishing sign-in. This takes a moment.". It then
  closes connected or shows the failure.
- When the handshake succeeds, the app holds the key in memory for this browser
  tab only, the modal closes, and the navbar switches to the connected state.
- When the handshake fails, the modal opens again and shows "Could not connect
  to OpenRouter. Please try again." under the action. The error clears when the
  learner closes the modal, and a retry replaces it with a fresh attempt; a
  successful retry never shows it again.
- While connected, reopening the modal shows "OpenRouter connected", a body
  confirming the connection and the memory-only key, one "Disconnect" action,
  and a short informational note that the key stays in the learner's OpenRouter
  account until revoked there, with a link to OpenRouter.
- Disconnecting asks the engine to forget the in-memory key; the modal stays
  open and flips back to the disconnected content and trigger.
- Connection is tab-memory only, so a full reload returns to the disconnected
  state.
- Lessons use the connected key. When no account is connected, a development
  mode may fall back to the local environment key; a production build never
  does. With neither key, the lesson fails with the existing key error.
- The learner can close the modal with the top-right cross, the Escape key, or
  a click outside the panel.
- What explicitly does NOT change in this spec: the lesson prompt, the provider
  draw policy, and the navbar home action.

# Constraints

- Follow [OpenRouter OAuth instructions](https://openrouter.ai/docs/guides/overview/auth/oauth)
  when implementing the OAuth mechanism, including the authorization code
  lifetime.
- Follow `DESIGN.md` for the modal, both action styles, focus, and touch
  targets.
- Follow `AGENTS.md` and `docs/ARCHITECTURE.md`; Tasks 7 and 9 are authorized to
  update the architecture document for the new engine surface.
- No new dependency, no new icon package, and no `Buffer` polyfill. The
  handshake uses browser capabilities already available in the app.
- The key is memory-only for the whole spec: never in browser storage, cookies,
  the URL, the DOM, or logs. Only the one-time PKCE verifier, state, and creation
  time may touch browser storage, across the redirect, and they are removed at
  once.
- The engine owns the protocol handshake: the one-time verifier and state, the
  sign-in link construction, the callback capture and cleanup, the exchange, and
  the connection truth. The UI only asks to start, to capture and finish a
  return, whether a session exists, and to disconnect; it never receives the
  key, the code, the verifier, or the session.
- The UI owns the browser transition. `beginAuthorization` returns a one-shot
  authorization URL, and the UI immediately performs a same-tab
  `location.replace` through a required `navigate` capability. The UI never
  parses the URL, reads `state`, uses `location.assign`, opens a new tab, or
  stores, renders, or logs the URL.
- Key precedence is connected session first, development fallback second, no key
  last. A connected session is never bypassed for the environment key.
- The development fallback is active only in development and never in
  production. No production build is made with the environment key set. The
  build-time key risk is accepted; no build-time guard is added.
- Connection is per-tab memory, so a reload returns to the disconnected state.
- The settings control receives its engine API and the `navigate` capability as
  required props from the composition root, so no rendered UI component imports
  the engine singleton directly or reads `window.location`.
- The callback query is removed synchronously before the first render, and a
  failed removal never starts an exchange.
- The engine start and finish entries never reject; they answer statuses.
- A UI navigation throw is a start failure: busy clears, the action re-enables,
  no session is stored, and the generic error appears. A pending record left by
  that throw expires after ten minutes and the next start overwrites it.
- Errors are transient UI state, never persisted.
- Disconnect is a secondary, non-destructive action that cannot fail. The
  connected view states that the key remains in OpenRouter until revoked there.
- Tests stay offline. No test calls OpenRouter.

# Tasks

- [x] Task 1 - A session value and an in-memory store
  - [x] The engine can represent an OpenRouter session and keep it for the
        current tab. Technical: new domain folder
        `src/services/engine/domain/openrouter-session/` with
        `OpenRouterSession.ts`; the key lives in a `#apiKey` private field and
        a public accessor reads it, so the field itself is unreachable and,
        with the accessor on the prototype, `Object.keys` and `JSON.stringify`
        on a session carry no key. The accessor is kept inside the engine by
        convention, not by a boundary. The creator trims the key and rejects an
        empty value with a plain error carrying no key text.
        New infrastructure file
        `src/services/engine/infrastructure/openrouter/sessionStore.ts`
        with module-level state starting at `null` plus
        `saveSession`, `readSession`, and
        `deleteSession`; the store stays internal to the engine, and no public
        engine API re-exports it.
  - [x] Prove the value and the store. Technical: colocated unit `*.test.ts`
        beside each file. Pin non-enumerability, empty rejection, and
        save/read/clear with a `deleteSession` reset between tests;
        never assert the key through a snapshot or a serialized object.
  - [x] Gate: build plus lint plus format plus both suite files, then full
        test.

- [x] Task 2 - The engine trades the code for a key
  - [x] The engine can turn the one-time code into a key without leaking
        anything to the UI. Technical: new adapter
        `src/services/engine/infrastructure/openrouter/exchangeCode.ts`
        sending one `POST` to
        `https://openrouter.ai/api/v1/auth/keys` with
        `Content-Type: application/json`, `Accept: application/json`, no
        `Authorization` header, `credentials: "omit"`, `redirect: "error"`,
        `mode: "cors"`, `referrerPolicy: "no-referrer"`, `cache: "no-store"`,
        a manual `AbortController` with a fifteen second timeout cleared in a
        `finally`, and no retry. It refuses an empty code or verifier before any
        request. A failure status is checked before the body is parsed, and the
        failure body is never read or logged. A success body is read as text and
        parsed as JSON inside a guard. The endpoint answers a CORS preflight with
        `Access-Control-Allow-Origin: *`, `POST`, and `content-type` in
        `Access-Control-Allow-Headers`, verified once on 2026-10-24, so the
        exchange can run in the browser. Body is
        `{ code, code_verifier, code_challenge_method: CODE_CHALLENGE_METHOD }`
        with the method imported from the one shared `S256` constant; the code
        and verifier are the only interpolated values. A successful answer must
        carry a `key` string with non-whitespace content; any other answer is an
        abnormal answer. The adapter returns that string unchanged, and the
        Task 1 creator owns trimming, so only one place trims.
        New
        `src/services/engine/infrastructure/openrouter/OpenRouterCodeExchangeError.ts`
        carries a safe cause only, an HTTP status or a local cause name. Every
        failure path logs at the adapter in dev only with the HTTP status and
        the safe local cause, and never logs the failure body, provider message,
        code, verifier, key, request body, or headers; the sanitized error
        travels up.
  - [x] Prove the request and the failure shape. Technical: colocated unit
        `exchangeCode.test.ts` on the shared browser runner with `msw/browser`
        `setupWorker`. Assert method, URL, JSON and accept content types, absent
        authorization header, omitted credentials, refused redirects, CORS mode,
        no-referrer policy, no-store cache, exact body with the shared `S256`
        constant, the provider key passing through unchanged, the empty code and
        verifier refusal before any request, a failure status checked before
        parsing and its body never read, and one rejection per abnormal answer
        shape plus one per non-success status, including a thrown request, an
        aborted timeout with fake timers, a non-JSON success body, and an empty
        key. Assert no secret appears in the sanitized error or the dev log.
  - [x] Gate: build plus lint plus format plus the adapter suite file, then
        full test.

- [x] Task 3 - One engine surface reports and clears the session
  - [x] The app can ask whether a session exists and disconnect without ever
        reading a key. Technical: new controller folder
        `src/services/engine/controller/openrouter-session/` with
        `openRouterSessionController.ts`. It exports `hasOpenRouterSession`,
        answering whether the Task 1 store holds a session without exposing the
        session or key, and `disconnectOpenRouterSession`, which clears the
        store and returns nothing; disconnect is idempotent and cannot fail,
        because it only clears module memory. New `openRouterSessionApi.ts`
        exports `openRouterSessionAPI` with `hasSession()` and `disconnect()` plus
        the `OpenRouterSessionAPI` type used by the UI prop; the sign-in entries
        arrive in Task 4, and the surface never exposes a key or a session
        value.
  - [x] Prove the wiring. Technical: colocated unit controller suite pinning
        `hasOpenRouterSession` false before a save, true after, and false after
        a disconnect, plus a second disconnect that stays safe. Colocated
        integration API suite `openRouterSessionApi.test.ts` driving the real
        singleton offline with a seeded store, then pinning `hasSession`, the
        cleared store after `disconnect`,
        and that the public surface exposes no key and no session read. Clear
        the store between tests.
  - [x] Gate: build plus lint plus format plus both suite files, then full
        test.

- [ ] Task 4 - The engine runs the PKCE protocol and prepares the redirect
  - [ ] The learner can leave for OpenRouter, approve the app, and come back,
        with the engine finishing the handshake and the UI only performing the
        page transition.
        Technical: new domain files
        `src/services/engine/domain/openrouter-session/OpenRouterAuthorizationStatus.ts`
        and `OpenRouterAuthorizationPolicy.ts`; new application files
        `src/services/engine/application/openrouter-session/beginOpenRouterAuthorization.ts`
        and `completeOpenRouterAuthorization.ts`; new browser infrastructure
        `src/services/engine/infrastructure/browser/pkce.ts`,
        `pendingStore.ts`, and `browserLocation.ts`; plus the authorization
        entries in
        `controller/openrouter-session/openRouterSessionController.ts`.
        The status module carries two as-const sets: start answers `ready` or
        `refused`, completion answers `none`, `failed`, or `connected`. The
        policy module carries the ten-minute pending lifetime.
        `pkce.ts` generates a 32-byte verifier and a 32-byte state from
        `crypto.getRandomValues`, encodes both as unpadded base64url, derives
        the `S256` challenge with `crypto.subtle.digest`, and exports one
        shared `CODE_CHALLENGE_METHOD` constant. It builds
        `https://openrouter.ai/auth` through `URLSearchParams`, with
        `callback_url` set to the app root supplied by the browser location
        adapter, `code_challenge`, `code_challenge_method` from the shared
        constant, `state`, and `key_label` `Tanuki Kanji`.
        `browserLocation.ts` owns the secure-origin predicate: it requires
        `window.isSecureContext` and a present
        `crypto.subtle`, plus an HTTPS origin or a loopback host (`localhost`,
        the `127.0.0.0/8` literal range, `[::1]`). It refuses plain HTTP on any
        other host and `file:` in every build mode, before the start is
        accepted.
        `pendingStore.ts` keeps `{ verifier, state, createdAt }` as JSON under
        `tanuki-kanji.openrouter.pkce` in `sessionStorage` with save, read, and
        clear. A malformed or expired record reads as absent and is cleared. A
        storage read or write failure is a refusal, never a silent pass; a
        clear failure after the verifier is read is ignored, because the next
        start overwrites the record and it dies with the tab.
        `browserLocation.ts` supplies the app root from
        `new URL(import.meta.env.BASE_URL, window.location.origin)`, is the
        only engine file that reads the callback query, and removes `code`,
        `state`, and
        `error` synchronously with `history.replaceState` while preserving the
        path, hash, and unrelated parameters. It does not navigate.
        The begin use case refuses an unsafe origin, generates the pair, saves
        the pending record, builds the link, and answers `ready` with the
        authorization URL or `refused`. It never rejects, and clears the pending
        record and answers refused if pair generation, storage, or link building
        throws.
        The complete use case answers `none` when no captured return exists;
        otherwise it reads a provider `error` before the state check, because
        OpenRouter does not echo `state` on denial, then clears the pending
        record before the exchange. It answers `failed` for a provider error, a
        missing code, a missing or expired record, a state mismatch, an unsafe
        origin, a storage read refusal, a query cleanup failure, an exchange
        failure, or a session save failure; it otherwise saves the Task 1
        session and answers `connected`. It never rejects.
        The controller captures the callback once: `consumeReturn()` reads
        `code`, `state`, and `error` synchronously, strips them from the URL,
        stores them in engine memory, and answers whether a return was found.
        It is idempotent; a cleanup failure marks a failed return and never
        starts an exchange. `completeAuthorization` takes the captured return
        synchronously at its start, so a second call answers `none` while the
        first exchange is in flight. `main.tsx` calls `consumeReturn` before the
        first render, and the Settings mount calls it again.
        `openRouterSessionAPI` gains `beginAuthorization`,
        `completeAuthorization`, and `consumeReturn`; its surface never exposes
        the key, code, verifier, or session directly. The only protocol value it
        returns is the one-shot authorization URL from `beginAuthorization` in a
        `ready` result, for immediate UI navigation. The UI must not parse or
        persist that URL.
  - [ ] Prove the handshake. Technical: colocated unit `pkce.test.ts` pinning
        the RFC 7636 verifier `dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk` to
        challenge `E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`, 43-character
        unpadded verifier and state, every authorization parameter with its
        encoded value, the callback URL from a base path, and the shared `S256`
        constant. Colocated unit `pendingStore.test.ts` pinning save, read,
        clear, malformed-record absence, expired-record absence with fake
        timers, a write refusal, a read refusal, and an ignored clear refusal.
        Colocated unit `browserLocation.test.ts` pinning the app root with a
        stubbed `BASE_URL` subpath, the HTTPS, loopback, and unsafe-origin
        predicate cases, the callback capture, synchronous removal preserving
        path, hash, and unrelated parameters, and a `replaceState` failure that
        answers a failed return. Colocated application suites
        `beginOpenRouterAuthorization.test.ts` and
        `completeOpenRouterAuthorization.test.ts` pin the start and completion
        status matrix, including a ready result with the URL, unsafe origin,
        storage write failure, link building failure, provider denial with no
        state, missing
        code, missing and expired record, state mismatch, storage read failure,
        exchange failure, save failure, no save on failure, and no rejection.
        Colocated controller and integration API suites
        `openRouterSessionController.test.ts` and
        `openRouterSessionApi.test.ts` drive the real singleton offline with a
        seeded pending record and a pushed callback URL: assert `consumeReturn`
        true before `complete` and false after, the query stripped before the
        exchange, `completeAuthorization` answering `none` on a second call
        while the first is in flight and after the captured return is spent,
        the store, and the remaining query. Mock the Task 2 adapter; no browser
        navigation happens in engine tests. Clear the pending record, the store,
        the captured return, and the URL between tests.
  - [ ] Gate: build plus lint plus format plus the helper, store, location,
        application, controller, and API suite files, then full test.

- [ ] Task 5 - A settings control with a state-aware modal
  - [ ] The loading illustration becomes a shared piece so the same rings frame
        the sign-in. Technical: move `AnimatedArtwork.tsx`,
        `AnimatedArtwork.module.css`, `LoadingRings.tsx`, and
        `LoadingRings.module.css` from `src/pages/LoadingPage/` to
        `src/components/AnimatedArtwork/`. The shared slot keeps only size and
        position; the circular picture treatment (`border-radius`,
        `object-fit`, `mix-blend-mode`, and the breathe keyframes) moves beside
        the picture in `LoadingPage.module.css`. `AnimatedArtwork` gains a
        `compact` size for the modal (`10rem` on mobile and `12rem` on desktop,
        with the slot at `6.5rem` and `7.5rem`) and its own short-viewport step
        (`8rem` visual with a `5.5rem` slot) so the rotated screen fits. The
        hero sizes and the loading page stay unchanged.
  - [ ] A learner can open and close an OpenRouter offer from the navbar, and
        the control reflects the connection. Technical: new
        `src/components/Navbar/Settings/Settings.tsx` plus
        `Settings.module.css` and `useSettings.ts`. The trigger is a button with
        `type="button"`, a 2.75rem square target, and an icon that is
        decorative with empty alt and `aria-hidden`. Disconnected uses
        `@material-symbols/svg-400/outlined/settings_alert.svg` and the
        accessible name `Settings, OpenRouter not connected`; connected uses
        `@material-symbols/svg-400/outlined/settings_account_box.svg` and the
        accessible name `Settings, OpenRouter connected`. Both states carry
        `aria-haspopup="dialog"` and an informative tooltip revealed on hover
        and on focus-visible (`OpenRouter sign-in` when disconnected,
        `OpenRouter account` when connected) to make the OAuth system clear.
        The modal is a native `<dialog>` opened with `showModal()` only while
        it is closed. The panel is a header row with an `<h2>` title and the
        top-right close button, then the body, the action, and the note slot.
        The dialog carries `aria-labelledby` for the title and
        `aria-describedby` for the body. It is closed by the close button named
        `Close settings`, the native Escape path, or a click on the backdrop
        when the event target is the dialog itself; a click inside the panel
        does not close. Opening focuses the close button, every close returns
        focus to the trigger, and tab order stays natural: close, action,
        informational link. The dialog is at most
        `min(28rem, calc(100vw - 2rem))` wide and
        `calc(100svh - 2rem)` tall, and the panel scrolls inside it.
        The disconnected view reads title `Connect to OpenRouter`, body
        `Connect your OpenRouter account to use your own credits for lessons.`,
        main action `Connect to OpenRouter`, and footnote `Your key stays in
        memory for this tab and is never saved. Reloading disconnects it.`.
        The connected view reads title `OpenRouter connected`, body `Your
        OpenRouter account is connected. Your key stays in memory for this tab
        and is never saved. Reloading disconnects it.`, main action
        `Disconnect`, and an informational note in the same slot the
        disconnected view uses for its error: `Disconnecting forgets the key in
        this tab. The key stays in your OpenRouter account until you revoke
        it.` followed by the link `Revoke in OpenRouter` to
        `https://openrouter.ai/keys`, opened in a new tab with
        `target="_blank"`, `rel="noopener noreferrer"`, and the accessible name
        `Revoke in OpenRouter (opens in a new tab)`. The note is common body copy, not an
        alert; when a connected state has an error, the error replaces the
        note. The connecting view reads title `Connecting to OpenRouter` and
        body `Finishing sign-in. This takes a moment.`, carries no action and no
        footnote, and frames the compact artwork with the outlined
        `@material-symbols/svg-400/outlined/lock.svg` mark inside the slot at
        `2rem`, on a `--color-surface` disc with a `1px solid
        var(--color-border)` ring. Its body is a `role="status"` region with
        `aria-busy="true"`, and the mark plus every ring and dot stay
        decorative. The title uses `--text-headline-md-*` in `--font-head`;
        the body uses `--text-body-md-*`; the footnote and informational note
        use `--text-body-sm-*`; the note and footnote use `--color-ink-soft`,
        because DESIGN.md reserves `muted` for placeholders, counters, and
        decorative marks, never body copy. The note link uses
        `--color-primary` with an underline and the global focus ring. The
        panel uses `--color-surface`, a `1px solid var(--color-border)` frame,
        `--radius-xl`, `var(--space-xl)` padding, and the DESIGN Level 1
        ambient bloom; the dialog backdrop carries the DESIGN Level 3 washi
        treatment with `color-mix(in srgb, var(--color-canvas) 85%, transparent)` plus
        `backdrop-filter: blur(8px)`, so the tint derives from the existing
        canvas token instead of a raw color. The panel takes no Level 2 shadow.
        The connect action uses `--color-primary`, `--color-on-primary`,
        `--radius-md`, a minimum height of 2.75rem, `--color-primary-hover` on
        hover, and the 1px lift only when reduced motion is not requested. The
        disconnect action uses the DESIGN secondary treatment:
        `--color-secondary-tint` background, `--color-secondary` text, a `1px
        solid` border of `color-mix(in srgb, var(--color-secondary) 25%,
        transparent)`, and the same radius, height, focus, and reduced-motion
        rules as the connect action. The close button is at least 44 by 44 px
        and uses `@material-symbols/svg-400/outlined/close.svg` at
        `var(--icon-md)`. `Settings` receives a required `openRouterSession`
        prop of type `OpenRouterSessionAPI` and a required `navigate` prop of
        type `(url: string) => void`, so the component imports no engine
        singleton and does not read `window.location`. The `Navbar` and `App`
        wiring arrives in Task 7. `useSettings(openRouterSession, navigate)`
        owns the dialog ref, the open and error state, and the `isConnected`
        state seeded synchronously from `openRouterSession.hasSession()`, plus
        the three close paths, so the component stays declarative.
  - [ ] Prove the shared artwork and the shell. Technical: new colocated
        `src/components/AnimatedArtwork/AnimatedArtwork.test.tsx` pinning the
        two decorative rings, the reduced-motion freeze, and the compact size,
        while the `LoadingPage` suite keeps covering the picture. Colocated
        integration `Settings.test.tsx` opens from the trigger and pins
        `aria-haspopup`, the hover and focus-visible tooltip, initial focus on
        the close button, the dialog role, accessible name and description, the
        heading level, all three close paths (close button, Escape, backdrop),
        a click on the panel padding that does not close, focus return, every
        exact string in the disconnected and connected views, the informational
        note, the revocation link's href, `target`, `rel`, and accessible name,
        the connecting `aria-busy`, and a closed dialog that stays in the DOM
        but out of the accessibility tree on mount. Pass a fake
        `OpenRouterSessionAPI` from a small `fakeOpenRouterSessionAPI` builder
        in `src/test-utils.tsx`, with `hasSession` false and `consumeReturn`
        false for the disconnected suite and `hasSession` true for the
        connected suite, plus a fake `navigate` function; no module mock, no
        singleton, no real navigation, and the suites stay offline. Render
        `Settings` directly with both fakes; the `App` and `Navbar` wiring is
        covered in Task 7.
  - [ ] Gate: build plus lint plus format plus the artwork and settings suite
        files, then full test.

- [ ] Task 6 - The offer runs the handshake, reports failure, and flips state
  - [ ] A learner can approve the app, land back connected, and disconnect with
        a clear failure story. Technical: the main action always clears the
        error state first; in the disconnected view it sets a busy state,
        disables the action, and calls
        `openRouterSessionAPI.beginAuthorization()`. The engine saves the
        pending record, builds the link, and answers `ready` with the
        authorization URL, or `refused`. On `ready`, the UI calls the injected
        `navigate(url)` once from a local value; the URL never enters component
        state, the DOM, storage, or logs. The modal stays open until the page
        leaves, so nothing is closed early. A `ready` answer keeps the action
        disabled while the page leaves. A refused start, which covers a crypto,
        origin, storage, or link-building failure, clears the busy state,
        re-enables the action, and shows the error without leaving the app. A
        throw from `navigate` is also a start failure: it clears the busy state,
        re-enables the action, shows the error, and leaves any pending record to
        expire or be overwritten. In the connected view the action calls
        `openRouterSessionAPI.disconnect()`, sets `isConnected` false, and
        leaves the modal open; the content flips to the disconnected view with
        no error path, and focus moves to the new Connect action because the
        Disconnect button unmounts. On mount, the component calls
        `openRouterSessionAPI.consumeReturn()`: a true answer opens the modal in
        the connecting view, then calls `completeAuthorization()` once per
        consumed return. `connected` reads `hasSession()`, closes the modal, and
        flips the trigger, or shows the failed content if no session was saved.
        `failed` reads `hasSession()` too: with a session it shows the connected
        content with the error replacing the informational note; without one it
        shows the disconnected content with the error copy. `none` closes the
        modal with no error. When
        `consumeReturn()` answers false, `completeAuthorization()` is not
        called. A close during the connecting state does not cancel the
        exchange: success still flips the trigger, and a later failure is kept
        for the next open. The error paragraph sits directly under the main
        action, reads
        `Could not connect to OpenRouter. Please try again.`, uses
        `--text-body-sm-*` typography in `--color-tertiary`, and uses
        `role="alert"`. The error is cleared by every close path and by
        starting a retry, is absent after a successful connect, is never
        stored, and adds no gap when absent. Success closes the modal, sets
        `isConnected` true, and flips the trigger to the connected icon and
        name. On a valid return, the pending record and callback query are
        already gone before the exchange starts, so a remount cannot replay
        them. `useSettings` owns the begin, complete, consume, disconnect, and
        one-shot navigate calls and the open-with-error decision, so the
        component only renders its state. No UI component reads
        `window.location` directly or parses the authorization URL; the injected
        navigate capability is the only browser transition.
  - [ ] Prove the flow. Technical: extend `Settings.test.tsx` with the fake
        `OpenRouterSessionAPI` builder and a fake `navigate`. Assert the action
        clears the error, disables while `beginAuthorization` is pending, calls
        it once, and a refused start re-enables it with the error. Resolve
        `beginAuthorization` as `ready` with a URL and assert `navigate` is
        called once with that URL, the URL is not rendered, stored, or logged,
        it is passed only to `navigate`, and the action stays disabled. Spy on
        the console methods and assert the URL never appears. Make `navigate`
        throw and assert the action re-enables, the generic error appears, and no
        session is stored.
        For the return, set `consumeReturn` true and a pending
        `completeAuthorization`: assert the connecting title, body,
        `role="status"`, `aria-busy`, the decorative lock mark, the compact
        artwork, and no action. Resolve `completeAuthorization` as `connected`
        with `hasSession` true and assert the closed modal, the session read,
        the connected trigger name, and no key or pending record in
        `localStorage`, `sessionStorage`, `document.cookie`, the URL, or the
        rendered DOM. Reopen the modal and assert the connected title, body,
        informational note, revocation link, and `Disconnect` action. Resolve
        `completeAuthorization` as `failed` with `hasSession` false and assert
        the same open modal flipped to the disconnected content with the
        `role="alert"` copy directly after the action in DOM order. Repeat
        `failed` with `hasSession` true and assert the connected content with
        the error replacing the note. Close the modal during connecting, then
        resolve `failed`: assert the next open shows the error; resolve
        `connected` instead: assert the trigger flips with no error. With
        `consumeReturn` false, assert `completeAuthorization` is not called.
        Assert that closing the modal removes the error, that reopening shows
        none, that starting a retry clears it before the engine call, and that
        a successful retry after an error shows no error. For disconnect, start
        from a connected fake, activate `Disconnect`, and assert the engine
        call, the still-open modal, the disconnected title, body, action, and
        footnote, focus on the Connect action, the disconnected trigger name,
        and no error. Keep `App.test.tsx` green with a fake `navigate` and no
        modal on an ordinary load. `main.tsx` calls
        `openRouterSessionAPI.consumeReturn()` before `render()`, so the callback
        query is gone before the first frame.
  - [ ] Gate: build plus lint plus format plus `Settings.test.tsx` and
        `App.test.tsx`, then full test.

- [ ] Task 7 - The navbar gains an actions group and the architecture names it
  - [ ] The settings control sits beside the home action without disturbing the
        brand or the dev badge. Technical: wrap `Settings` plus the existing
        home mark in a `div` with class `actions` in `Navbar.tsx`, and add
        `display: flex`, `align-items: center`, and `gap: var(--space-sm)` to
        that class in `Navbar.module.css`. Settings comes first, home second,
        in natural DOM order. `App` takes required `openRouterSession` and
        `navigate` props and passes them to `Navbar`, which forwards both to
        `Settings`; `main.tsx` passes the singleton and
        `(url) => window.location.replace(url)`. Update `App.test.tsx` and
        `Navbar.test.tsx` to pass a fake `OpenRouterSessionAPI` and a fake
        `navigate`, keep the dev badge as the second child and the actions group
        as the last child, assert both actions are inside it, and follow natural
        tab order: the first Tab reaches Settings and the second reaches home.
        Update `docs/ARCHITECTURE.md`: add
        `application/openrouter-session/` as the layer holding the OAuth
        orchestration for this API only, with the dependency chain Api to
        controller to application to domain and controller to infrastructure to
        domain; document the domain status sets and the ten-minute policy; the
        `controller/openrouter-session/` surface with `beginAuthorization`,
        `completeAuthorization`, `consumeReturn`, `hasSession`, and
        `disconnect`; the engine-prepared authorization URL and the UI-owned
        same-tab replace through the required `navigate` prop;
        `infrastructure/browser/` for Web Crypto PKCE, the sessionStorage pending
        store, and the browser location adapter without navigation;
        `infrastructure/openrouter/` for the exchange adapter plus error, the
        in-memory session store, and the resolver; the non-enumerable domain key;
        the state-aware Settings trigger; the required `openRouterSession` and
        `navigate` props from `main.tsx` through `App` and `Navbar` with no
        rendered component importing the singleton or reading `window.location`;
        the `consumeReturn` call before the first render; and the testing split
        for the PKCE vector, the secure-origin and callback matrix, the pending
        expiry, the start `ready`/`refused` matrix, the UI navigation throw, the
        completion status matrix, the mocked exchange, the fake session API
        builder and fake `navigate`, and the App axe suites using both fakes.
  - [ ] Gate: build plus lint plus format plus `App.test.tsx` and
        `Navbar.test.tsx`, then full test.

- [ ] Task 8 - Accessibility proof at the app level
  - [ ] The open offer is accessible in every state at every supported
        viewport. Technical: extend `src/App.axe.test.tsx` with four describes,
        each passing a fake `OpenRouterSessionAPI` and a fake `navigate` into
        `App` alongside the lesson engine. The disconnected fake answers
        `hasSession` false and `consumeReturn` false; open the trigger named
        `Settings, OpenRouter not connected`, wait for the dialog, and run axe.
        The connected fake answers `hasSession` true and `consumeReturn` false;
        open the trigger named `Settings, OpenRouter connected`, wait for the
        dialog, and run axe. The connecting fake answers `consumeReturn` true,
        `hasSession` false, and `completeAuthorization` with a promise that
        never settles; render `App`, wait for the dialog named `Connecting to
        OpenRouter`, and run axe. The failed-return fake answers
        `consumeReturn` true, `hasSession` false, and `completeAuthorization`
        with `failed`; render `App`, wait for the error text, and run axe. No
        test spies on a singleton. All four run at mobile `390x844`, rotated
        `844x390`, and desktop `1280x800`, and no network call happens on any
        path.
  - [ ] Gate: build plus lint plus format plus `App.axe.test.tsx`, then full
        test.

- [ ] Task 9 - Lessons read the connected session with a development fallback
  - [ ] The lesson path replaces its direct environment read with the
        connected session and a development fallback. Technical: new
        `src/services/engine/infrastructure/openrouter/resolveSession.ts`.
        It calls `readSession()`; a stored session returns as is. With no
        session, and only when `import.meta.env.DEV`, it reads
        `VITE_OPENROUTER_API_KEY` and returns
        `OpenRouterSession.create(value)` when the trimmed value is non-empty,
        without saving it. Otherwise it returns `undefined`. It logs nothing and
        names no source in an error. `getTanukiKanjiLesson` calls the resolver
        once at the start and hands the session, the domain value, to the
        existing private `createOpenRouterClient(session)`, which reads
        `session.apiKey` inside the adapter; client creation stays in that file
        and no raw key crosses the domain boundary. Change the missing-key cause
        from `missing VITE_OPENROUTER_API_KEY` to `missing OpenRouter API key`,
        because either source can be absent. The resolver is the only
        lesson-path caller of `readSession`; it hands the value to the lesson
        adapter, which reads `apiKey` at the boundary. The store stays internal
        and the public session API gains nothing. Update `README.md`,
        `.env.example`, and `docs/ARCHITECTURE.md`: connected key first, the
        environment key is a development fallback, production never uses it, the
        infrastructure bullet moves the environment read from the lesson adapter
        to the resolver, `Disconnect` forgets the key locally while it stays in
        the learner's OpenRouter account until revoked, the connected view links
        to `https://openrouter.ai/keys`, and a failed exchange after OpenRouter
        created a key can leave an unused key that should be revoked there.
        Prompt, model, draw policy, timeout, and error sanitizing stay unchanged.
  - [ ] Prove the source choice and the adapter handoff. Technical: colocated
        unit `resolveSession.test.ts` pinning session-first precedence over a
        set environment key, the development fallback as a session when no
        session exists, `undefined` when neither exists, a blank or
        whitespace-only environment value as absent, and production ignoring the
        environment key even when set via `vi.stubEnv("DEV", false)`. Clear the
        store between tests. Extend `getTanukiKanjiLesson.test.ts`: clear the
        store between tests, keep the existing environment-driven tests as the
        development fallback, add a seeded-session case with no environment key
        that proves the session key reaches the provider Authorization header,
        and update the missing-key cause assertion. No test asserts a key
        through a snapshot or a serialized object.
  - [ ] Gate: build plus lint plus format plus both suite files, then full
        test.

# Acceptance

- When the learner activates the navbar settings control while disconnected, a
  centered modal appears over the app with the offer, the main action, and the
  footnote, and the control carries the `settings_alert` mark and the name
  `Settings, OpenRouter not connected`.
- When the learner activates `Connect to OpenRouter`, the action disables while
  the engine prepares the sign-in, the engine builds the link and keeps the
  one-time verifier and state, and returns a one-shot authorization URL. The UI
  immediately performs a same-tab `location.replace` through the injected
  navigate capability, and the browser goes to OpenRouter with the app callback,
  PKCE challenge, state, and `Tanuki Kanji` label. The UI never receives the
  key, code, verifier, or session, and it does not store, render, or log the
  authorization URL.
- When the app cannot start safely, because the browser is not on a secure
  origin, the one-time record cannot be kept, the link cannot be built, or the
  UI navigation throws, the browser never leaves the app, no session is stored,
  the action re-enables, and the modal shows `Could not connect to OpenRouter.
  Please try again.` directly under the action. A pending record left by a
  navigation throw expires after ten minutes or is overwritten by the next
  start.
- When OpenRouter returns a valid code and matching state within ten minutes,
  the modal first shows the connecting state, then the engine exchanges it,
  stores an OpenRouter session in memory, removes the pending record and
  callback query before the exchange, closes the modal, and flips the control
  to the `settings_account_box` mark and the name
  `Settings, OpenRouter connected`, with no key in browser storage, cookies,
  the URL, or the DOM.
- While the exchange runs, the modal shows `Connecting to OpenRouter` and
  `Finishing sign-in. This takes a moment.`, framed by the loading rings with a
  lock mark, exposes an `aria-busy` status, and offers no action.
- When a callback exists but the code is missing, the record is missing or
  older than ten minutes, the state is mismatched, the origin is unsafe, the
  query cannot be removed, or the exchange or save fails, no session is stored
  and the modal shows `Could not connect to OpenRouter. Please try again.`
  directly under the action as a `role="alert"` message.
- When no callback exists on mount, no connecting state appears, no exchange
  starts, and the modal stays closed with no error.
- When the learner closes the modal by cross, outside click, or Escape, it
  closes, focus returns to the settings control, and any connection error is
  gone.
- When the learner retries after a failure, the error clears; a later
  successful handshake leaves the modal closed with no error.
- When the learner reopens the modal while connected, it shows
  `OpenRouter connected`, the connected body, the informational note that the
  key remains in OpenRouter until revoked, the `Revoke in OpenRouter` link to
  `https://openrouter.ai/keys`, and `Disconnect`.
- When the learner activates `Disconnect`, the engine clears the in-memory
  session, the modal stays open and returns to the disconnected content, and
  the control returns to `settings_alert` and
  `Settings, OpenRouter not connected`.
- While a session is connected, a lesson request uses that session key and does
  not fall back to the environment key.
- In development mode with no session, a lesson request uses
  `VITE_OPENROUTER_API_KEY` when it is set. A production build never uses that
  environment key.
- With neither a session nor an applicable environment key, the lesson fails
  with the missing-key error and no provider request is sent.
- A full reload returns the app to the disconnected state because the session
  is memory-only.
- Final full loop: `npm run build` + `npm run lint` + `npm run format` +
  `npm run test`; axe at App level stays clean with the modal open in every
  state at all three viewports.
