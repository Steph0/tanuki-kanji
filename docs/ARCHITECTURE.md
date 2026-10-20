# ARCHITECTURE.md - UI and Engine organization

Source of truth for code organization. `DESIGN.md` owns styling; this file
owns layering, naming, and how each side is tested.

---

## UI–engine communication

- UI renders and keeps local state; engine owns the rules and answers plain
  data the UI renders.
- UI calls the engine through one public file per API (`parseXApi.ts`),
  exposing a singleton plus statuses, limit, and response type.
- Dependencies point one way: `pages` → Api → Controller → `application/`
  → `domain/`, plus Controller → `infrastructure/` → `domain/`. The domain
  stands alone; the application layer reads the domain only, and the
  controller plus Api stay thin inbound adapters.

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

- `src/services/engine/` holds framework-free TypeScript in four parts:
  `domain/`, `application/`, `controller/`, `infrastructure/`.
- `domain/`: pure rules, one kebab-case folder per world (e.g.
  `kanji-input/`); Uppercase files for value objects and vocabulary,
  lowercase for domain services. Tunable rules live in their own policy
  module next to the vocabulary. The ports the outbound adapters implement
  live here too (`PascalCase` type file), so the application layer and the
  adapters both read the domain only.
- `application/<feature>/`: one folder per feature, holding the use cases
  that orchestrate it (decisions, sequencing). A use case reads the domain
  only, takes its collaborators by injection with the real defaults, and
  answers the domain result or rejects; SDK plus env access never reach it.
- `controller/<feature>/`: one folder per API mirroring the world.
  `parseXApi.ts` carries the public surface and the ready singleton;
  `parseXController.ts` carries the factory plus the `mapToResponse`
  presenter, delegating to its use case with the injected defaults
  unchanged. It stays thin: no rule, no SDK import.
- `infrastructure/<provider>/`: one folder per outbound provider, holding
  the adapter implementing a domain port plus the error it throws. It is the
  only place importing a vendor SDK or reading `import.meta.env`. An adapter
  reads its key from `import.meta.env` at call time, identifies the app to
  the provider, sets an explicit timeout on the request, keeps the SDK retry
  policy off, and owns the error posture: the full provider error is logged
  once here in dev only (`import.meta.env.DEV`), and a sanitized error
  carrying a safe cause (status or code) travels up.

### Naming

- Consumer singleton `*API`, factory `*ControllerFactory`, mapper
  `mapToResponse` in the controller. Response types are defined where they
  are produced and re-exported outward.
- Runtime constants read `UPPER_SNAKE`, types read `PascalCase`.

### Testing

- `*.test.ts` suites, no DOM.
- Unit, behavior (`application/<feature>/<use-case>.test.ts`): the domain
  handoff plus orchestration, fed with real inputs.
- Unit, contract (`controller/<feature>/parseXController.test.ts`): the
  response contract plus interaction with the use case, through stubs; the
  mapper is pinned here.
- Integration (`parseXApi.test.ts`): one flat wiring proof through the
  singleton.
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
