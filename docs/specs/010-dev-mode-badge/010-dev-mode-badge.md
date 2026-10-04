# 010 — Dev mode badge

# Why

Dev works on parallel worktrees/folders on different ports, with several dev
servers running at once. Folder names hold the feature hint, so a tiny
dev-only marker showing the current folder name on the UI removes the
ambiguity of which instance is on screen.

# What

A small dev-only marker in the top navigation, placed next to the brand and
away from the right-side icons (so it is never tapped by accident):

- Shows the name of the folder currently served by the dev server, so parallel
  instances on different ports are distinguishable at a glance.
- Short red text in a plain pill; long names are shortened in the middle
  (start + "..." + end); the full name stays available on hover/focus.
- Tapping or clicking it hides it until the next reload. No restore control:
  refresh to bring it back.
- Takes only the space it can without moving anything else; shrinks rather
  than pushing icons around.
- Visible only on the dev server. Never in production builds, never in tests.

# Constraints

- No new `package.json` dependencies, no external CDN/`<link>`.
- Folder name source: `vite.config.ts` `define` (e.g. `__APP_ROOT_DIR_NAME__`
  from `basename(process.cwd())`, `JSON.stringify`-ed) + ambient declaration
  (e.g. `src/vite-env.d.ts`). No runtime `fetch`, no `window.location`
  parsing, no checked-in `.env` per folder. Component accepts an optional
  `rootName` prop defaulting to the defined constant so tests can inject
  values without touching config.
- Gate: `import.meta.env.DEV && import.meta.env.MODE === "development"` as the
  first check returning `null`. `DEV` alone is not enough: Vitest runs with
  `DEV === true` under `MODE === "test"`, so the `MODE` check is what keeps
  the badge out of tests (and out of `dist`, where it is dead-code-eliminated).
- Text stays on the `--color-tertiary` token; pill shape via existing
  `--radius-*`. No computed colors, no inline styles: all design lives in the
  module CSS.
- Zero layout impact: shrinkable (`min-width: 0`, `ellipsis` backstop), never
  overlaps or displaces the right-side icons. No fixed touch-target size: a
  tappable chip with modest padding is enough.

# Tasks

- [x] Task 1 — Config + component
  - [ ] `vite.config.ts`: `define` root basename constant; add types
        `d.ts` declaration.
  - [ ] `DevModeBadge.tsx`: gate, middle-truncation helper (pure,
        unit-testable: length > 10 → `slice(0, 4) + "..." + slice(-3)`),
        dismiss `useState`, `<button>` with full-name `title`/`aria-label`.
  - [ ] `DevModeBadge.module.css`: short red badge (`--color-tertiary` text,
        pill/chip shape via existing `--radius-*`), `nowrap` + `ellipsis`
        backstop, `:focus-visible` outline, parked next to the brand
        (`margin-right: auto` keeps it off the right-side icons).
  - [ ] Tests: hidden by default (test env is `MODE === "test"`, no stubbing
        needed); opt-in by direct assignment (`import.meta.env.MODE =
        "development"`, reset afterwards — never `vi.stubEnv("DEV", "false")`,
        the string `"false"` is truthy); middle truncation (`"tanuki-kanji-bare"`
        → `"tanu...are"`, short names untouched);
        full name exposed accessibly; tap/click/keyboard hides it.
  - [ ] Gate — run the testing loop.

- [x] Task 2 — Navbar wiring + invisibility
  - [ ] `Navbar.tsx`: render `<DevModeBadge />` right after the brand block;
        no layout shift on mobile/desktop (existing `space-between` preserved,
        badge hugs the brand via `margin-right: auto`).
  - [ ] Tests with the code: with dev mode assigned, badge shows before the
        home mark; by default (test env) no badge text and no button role;
        existing Navbar banner/navigation/logo tests stay green.
  - [ ] Gate — run the testing loop.

# Acceptance

- `npm run dev` in folder `X` shows a short red `X`-derived badge (long names
  shortened middle-style, e.g. `"tanuki-kanji-bare"` → `"tanu...are"`) next
  to the brand; tapping it hides it until reload.
- `npm run build` + `vite preview` (prod) shows no badge, no button, no
  folder-name string in the rendered DOM; prod bundle contains no dev marker.
- Test suite shows no badge anywhere by default (no stubbing gymnastics).
- Parallel dev servers on different ports/folders each show their own folder
  name.
- Testing loop green; axe at App level stays clean (badge is a standard
  button, dev-server-only, absent from tests and prod scans).
