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
  → `domain/`. The domain stands alone; the application layer reads the
  domain only, and the controller plus Api stay thin inbound adapters.

## UI

### Layout

- `src/pages/` plus `src/components/` (Preact).

### Testing

- `*.test.tsx` suites colocated with components, running in browser mode
  with real CSS.

## Engine

### Layout

- `src/services/engine/` holds framework-free TypeScript in four parts:
  `domain/`, `application/`, `controller/`, `infrastructure/` (placeholder
  for a later spec).
- `domain/`: pure rules, one kebab-case folder per world (e.g.
  `kanji-input/`); Uppercase files for value objects and vocabulary,
  lowercase for domain services. Tunable rules live in their own policy
  module next to the vocabulary.
- `application/<feature>/`: one folder per feature, holding the use cases
  that orchestrate it (decisions, sequencing). A use case reads the domain
  only, takes its collaborators by injection with the real defaults, and
  answers the domain result or rejects; SDK plus env access never reach it.
- `controller/<feature>/`: one folder per API mirroring the world.
  `parseXApi.ts` carries the public surface and the ready singleton;
  `parseXController.ts` carries the factory plus the `mapToResponse`
  presenter, delegating to its use case with the injected defaults
  unchanged. It stays thin: no rule, no SDK import.

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
- `describe` names carry `unit` / `integration`, with `nominal` / `errors`
  sub-contexts where a matrix exists.
