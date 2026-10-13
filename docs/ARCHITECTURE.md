# ARCHITECTURE.md - UI and Engine organization

Source of truth for code organization. `DESIGN.md` owns styling; this file
owns layering, naming, and how each side is tested.

---

## UI–engine communication

- UI renders and keeps local state; engine owns the rules and answers plain
  data the UI renders.
- UI calls the engine through one public file per API (`parseXApi.ts`),
  exposing a singleton plus statuses, limit, and response type.
- Dependencies point one way: `pages` → Api → Controller → `domain/`.
  The domain stands alone.

## UI

### Layout

- `src/pages/` plus `src/components/` (Preact).

### Testing

- `*.test.tsx` suites colocated with components, running in browser mode
  with real CSS.

## Engine

### Layout

- `src/services/engine/` holds framework-free TypeScript in three parts:
  `domain/`, `controller/`, `infrastructure/` (placeholder for a later
  spec).
- `domain/`: pure rules, one kebab-case folder per world (e.g.
  `kanji-input/`); Uppercase files for value objects and vocabulary,
  lowercase for domain services. Tunable rules live in their own policy
  module next to the vocabulary.
- `controller/<feature>/`: one folder per API mirroring the domain folder.
  `parseXApi.ts` carries the public surface and the ready singleton;
  `parseXController.ts` carries the factory and the private mapper.

### Naming

- Consumer singleton `*API`, factory `*ControllerFactory`, mapper
  `mapToResponse` in every controller. Response types are defined where
  they are produced and re-exported outward.
- Runtime constants read `UPPER_SNAKE`, types read `PascalCase`.

### Testing

- `*.test.ts` suites, no DOM.
- Unit (`parseXController.test.ts`): response contract plus interaction
  with the creator, through stubs.
- Integration (`parseXApi.test.ts`): one flat wiring proof through the
  singleton.
- `describe` names carry `unit` / `integration`, with `nominal` / `errors`
  sub-contexts where a matrix exists.
