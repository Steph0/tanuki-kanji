# ARCHITECTURE.md - UI and Engine organization

Source of truth for code organization. `DESIGN.md` owns styling; this file
owns layering, naming, and how each side is tested.

---

## UI–engine communication

- UI renders and keeps local state; engine owns the rules and answers plain
  data the UI renders.
- UI calls the engine through one public file per API (`parseXApi.ts`),
  exposing a singleton plus statuses, limit, and response type.
- Dependencies point one way: `pages` → Api → controller → `application/` →
  `domain/`, plus controller → `infrastructure/` → `domain/`. The domain
  stands alone. A controller and an adapter are both outer ring, so a
  controller naming an adapter is a lateral dependency, never an outward
  one. The controller plus Api stay thin inbound adapters (the lesson
  controller excepted: it validates and raises its boundary error).
  `application/` exists for the OpenRouter OAuth API only, because its start
  and finish entries orchestrate domain policy plus browser infrastructure.
- `TanukiKanjiProvider` is the app's single service seam, in the spirit of
  `LocationProvider`: it defaults to the lesson API (`TanukiKanjiLessonAPI`),
  the OpenRouter session API, and `window.location.replace` for `navigate`,
  and accepts partial overrides for tests. `App` takes only that optional
  override, so `src/main.tsx` renders `<App />` with no service props after
  the pre-render callback capture. Children read narrow commands through
  `useTanukiKanjiLesson`, `useOpenRouterSession`, and `useBrowserNavigate`;
  the provider module is the only UI module importing the real singletons,
  and no leaf component reads `window.location`.
- `src/main.tsx` calls `openRouterSessionAPI.captureAuthorizationReturn()`
  before the first render, so the callback query is gone before the first
  frame, then `openRouterSessionAPI.connectDevelopmentSession()`, so a local
  development key starts the app connected.

## UI

### Layout

- `src/pages/` plus `src/components/` (Preact).
- `src/hooks/useTanukiKanjiServices.tsx` holds `TanukiKanjiProvider` and the
  narrow service hooks. The provider value is memoized on its three inputs so
  consumers do not re-render on unrelated parent renders.
- `src/components/Navbar/Settings/` holds the state-aware settings control and
  its modal. `Settings` reads `useOpenRouterSession()` and
  `useBrowserNavigate()` and hands both to `useSettings`, which owns the
  dialog refs, the reducer-driven status, the begin/capture/complete/
  disconnect calls, and the one-shot `navigate` call; the views render only
  the status they are given.

### Testing

- `*.test.tsx` suites colocated with components, running in browser mode
  with real CSS.
- A mock lesson is a plain `vi.fn`; assert calls with
  `expect(lesson).toHaveBeenCalledWith(...)`.
- `pendingLesson()` from `src/test-utils.tsx` covers the never-settles case.
- Sub-app suites render through `renderWithLesson(ui, lesson)`; UI that does
  not call the lesson API uses `renderWithServices(ui, services)`. Both
  mount the real `TanukiKanjiProvider`, default to a fake
  `fakeOpenRouterSessionAPI()` and a fake `navigate`, and accept overrides, so
  no suite wires a component by hand. Hook suites declare the provider as a
  local `renderHook` wrapper.
- `App` takes only optional `services` overrides; production relies on the
  provider defaults. App suites render `<App services={{
  tanukiKanjiLesson: lesson, openRouterSession: fakeOpenRouterSessionAPI(),
  navigate: vi.fn() }} />`; repeated suites use the same fakes from
  `src/test-utils.tsx`, never a module mock or the real singleton. The App
  axe suites use the same override, including the modal states.
- `src/hooks/useTanukiKanjiServices.test.tsx` pins the real service
  defaults, the partial override merge, and the outside-provider error.
- A new engine service extends the provider and helper, or types fail.

## Engine

### Layout

- `src/services/engine/` holds framework-free TypeScript in four parts:
  `domain/`, `application/`, `controller/`, and `infrastructure/`;
  `application/` holds only the OpenRouter OAuth orchestration.
- `domain/`: pure rules, one kebab-case folder per world (e.g.
  `kanji-input/`); Uppercase files for value objects and vocabulary,
  lowercase for domain services. Tunable rules live in their own policy
  module next to the vocabulary. A domain value crosses into a provider
  call as that domain value, never as a raw string, so an unvalidated word
  cannot cross the boundary.
- `application/openrouter-session/`: orchestration for the OAuth API only.
  `beginOpenRouterAuthorization` answers `ready` with the one-shot
  authorization URL or `refused`; `captureOpenRouterAuthorizationReturn`
  captures the callback once into `capturedReturnStore`, which owns that
  application state; `completeOpenRouterAuthorization` takes the stored return
  so it is spent once and answers `none`, `failed`, or `connected`.
  `domain/openrouter-session/` carries both
  status sets and the ten-minute pending policy.
- `controller/<feature>/`: one folder per API mirroring the world.
  `parseXApi.ts` carries the public surface plus the ready singleton, and
  stays a pure public surface: no wiring, no collaborator.
  `parseXController.ts` carries the engine entry plus the `mapToResponse`
  presenter. The engine entry is named after what it does
  (`parseKanjiInput`, `runTanukiKanjiLesson`) and is a plain function. A
  controller needing an outbound adapter names it directly, so the whole
  path is ctrl+clickable from the controller. It stays thin: no rule (the
  lesson controller excepted), no SDK import. The lesson controller applies
  the input validation through `KanjiInput.create`, owns the
  `InvalidKanjiInput` boundary error, calls the provider adapter, and maps
  the lesson to its text with no `mapToResponse` presenter.
- `controller/openrouter-session/`: `openRouterSessionApi.ts` exposes
  `beginAuthorization`, `completeAuthorization`, `captureAuthorizationReturn`,
  `connectDevelopmentSession`, `hasSession`, and `disconnect`.
  `captureAuthorizationReturn` delegates to the application capture use case,
  which strips the callback query once and stores the return;
  `completeAuthorization` spends it, so a second call answers `none`. The
  surface never exposes the key, code, verifier, or session. Its only
  protocol value is the one-shot authorization URL, which the UI hands
  straight to `navigate` for a same-tab `location.replace` and never parses,
  stores, renders, or logs.
- `infrastructure/browser/`: `pkce.ts` builds the verifier, state, `S256`
  challenge, and authorization link with Web Crypto; `pendingStore.ts` keeps
  the one-time verifier, state, and creation time in `sessionStorage`;
  `authorizationOrigin.ts` owns the secure-origin predicate; and
  `browserLocation.ts` is the only engine file that reads the callback query,
  removing `code`, `state`, and `error` synchronously without navigating.
- `infrastructure/openrouter/` (OpenRouter OAuth): `exchangeCode.ts` plus
  `OpenRouterCodeExchangeError.ts` trade the code for a key with browser
  `fetch`; `sessionStore.ts` keeps the session in module memory and exposes
  `readSession` only inside the engine; and `developmentSession.ts` connects
  `VITE_OPENROUTER_API_KEY` as the session at app start, only when
  `import.meta.env.DEV`, so local development skips the handshake. The
  controller exposes it as `connectDevelopmentSession`. A production build
  never reads that key. The
  domain key sits behind a `#apiKey` private field with a prototype
  accessor, so it is non-enumerable and absent from `Object.keys` and
  `JSON.stringify`.
- `infrastructure/<provider>/`: one folder per outbound provider, holding
  the adapter plus the error it throws. It is the
  only place importing a vendor SDK. The adapter reads the connected domain
  session and its `apiKey` at the boundary, so no raw key crosses
  into the application. It identifies the app to the provider, sets an
  explicit timeout on the request, keeps the SDK retry
  policy off, owns the draw policy (a failure a redraw could fix is asked
  again, because a free-model router picks another model each time), and
  owns the error posture: each failed attempt logs the full provider error
  here in dev only (`import.meta.env.DEV`), and a sanitized error
  carrying a safe cause (status or code) travels up.
- `infrastructure/logging/logEngineFailure.ts`: the one dev-only logger.
  Every engine `catch` binds its failure and reports it through this
  function, so no failure disappears without at least a dev console line.
  A caught failure stays out of production output.

### Naming

- Consumer singleton `*API`, controller entry named after what it does
  (`parseKanjiInput`, `runTanukiKanjiLesson`), mapper
  `mapToResponse` in the controller. Response types are defined where they
  are produced and re-exported outward.
- Runtime constants read `UPPER_SNAKE`, types read `PascalCase`.

### Testing

- `*.test.ts` suites, no DOM.
- Unit, contract (`controller/<feature>/parseXController.test.ts`): the
  response contract fed with real inputs, plus the handoff to the domain
  pinned with `vi.spyOn` on the domain static; the mapper is pinned here
  where the API defines one. The lesson controller suite mocks the provider
  adapter module with `vi.mock` and drives a `vi.fn` fake, so it asserts
  what the provider received and that it is never called for an invalid
  word.
- Integration (`parseXApi.test.ts`): one flat wiring proof through the
  singleton. The lesson Api suite mocks the provider adapter module for a
  fake provider, so the real singleton stays offline.
- Unit, provider (`infrastructure/<provider>/<adapter>.test.ts`): the
  request the adapter sends plus its failure shape, driven through MSW.
- `describe` names carry `unit` / `integration`, with `nominal` / `errors`
  sub-contexts where a matrix exists.
- Only the Api integration suite calls the real singleton, offline; every
  other suite stays on a mock.
- No suite reaches the network. HTTP is fully intercepted by MSW through
  `msw/browser` `setupWorker`; `msw/node` is unusable, since the browser
  runner rejects its `node:http` import.
- A suite starts the worker with an origin-root URL,
  `worker.start({ serviceWorker: { url: "/mockServiceWorker.js" } })`, since
  the worker only holds the page scope from there.
- `vite.config.ts` registers `msw/vite` in `worker-only` mode, gated on
  `process.env.VITEST`. Ungated, the plugin writes `mockServiceWorker.js`
  into every build; never commit it under `public/`.
- OpenRouter OAuth splits by responsibility: `pkce.test.ts` pins the RFC 7636
  verifier-to-challenge vector and every authorization parameter;
  `authorizationOrigin.test.ts` and `browserLocation.test.ts` pin the
  secure-origin and callback-cleanup matrices; `pendingStore.test.ts` pins
  the ten-minute expiry; the two application suites pin the start
  `ready`/`refused` and completion `none`/`failed`/`connected` matrices; the
  controller and Api suites drive the real singleton offline with the
  exchange adapter mocked and the callback in memory, so no navigation
  happens. UI suites drive the session through `fakeOpenRouterSessionAPI()`
  plus a fake `navigate`; that fake also covers the UI navigation throw.
