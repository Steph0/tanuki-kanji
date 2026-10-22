# ARCHITECTURE.md - UI and Engine organization

Source of truth for code organization. `DESIGN.md` owns styling; this file
owns layering, naming, and how each side is tested.

---

## UI–engine communication

- UI renders and keeps local state; engine owns the rules and answers plain
  data the UI renders.
- UI calls the engine through one public file per API (`parseXApi.ts`),
  exposing a singleton plus statuses, limit, and response type.
- Dependencies point one way: `pages` → Api → Controller → `domain/`, plus
  Controller → `infrastructure/` → `domain/`. The domain stands alone. A
  controller and an adapter are both outer ring, so a controller naming an
  adapter is a lateral dependency, never an outward one. The controller plus
  Api stay thin inbound adapters (the lesson controller excepted: it
  validates and raises its boundary error).

## UI

### Layout

- `src/pages/` plus `src/components/` (Preact).

### Testing

- `*.test.tsx` suites colocated with components, running in browser mode
  with real CSS.
- Mock engine is a plain `vi.fn`; assert calls with
  `expect(engine).toHaveBeenCalledWith(...)`.
- `pendingEngine()` from `src/test-utils.tsx` covers the never-settles case.
- Sub-app suites render through `renderWithEngine(ui, engine)`. Hook suites
  declare the provider as a local `renderHook` wrapper.
- `App` takes a required `engine` prop, picked in `src/main.tsx` beside the
  global stylesheet import. App suites render `<App engine={engine} />`.
- A new engine API extends the helper, or types fail.

## Engine

### Layout

- `src/services/engine/` holds framework-free TypeScript in three parts:
  `domain/`, `controller/`, `infrastructure/`.
- `domain/`: pure rules, one kebab-case folder per world (e.g.
  `kanji-input/`); Uppercase files for value objects and vocabulary,
  lowercase for domain services. Tunable rules live in their own policy
  module next to the vocabulary. A domain value crosses into a provider
  call as that domain value, never as a raw string, so an unvalidated word
  cannot cross the boundary.
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
- `infrastructure/<provider>/`: one folder per outbound provider, holding
  the adapter plus the error it throws. It is the
  only place importing a vendor SDK or reading `import.meta.env`. An adapter
  reads its key from `import.meta.env` at call time, identifies the app to
  the provider, sets an explicit timeout on the request, keeps the SDK retry
  policy off, owns the draw policy (a failure a redraw could fix is asked
  again, because a free-model router picks another model each time), and
  owns the error posture: each failed attempt logs the full provider error
  here in dev only (`import.meta.env.DEV`), and a sanitized error
  carrying a safe cause (status or code) travels up.

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
