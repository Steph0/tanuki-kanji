# AGENTS.md - Development Guidelines & Technical Specifications

This document outlines the architectural rules, security constraints, and coding standards required for developing this webapp.

---

## CRITICAL RULES - MUST FOLLOW

### RESPONSES

- Be concise

### PLANNING MODE

- Ask clarifying questions
- Never assume design, tech stack, features

### CHANGE / EDIT MODE

- Update/create tests for features
- Use best model: premium for complex tasks, mid-tier for simple tasks, docs or lookups
- Tool call cap: stop + explain after 5 tools with no progress
- Never use external sources (`<link>`, external CDN, dependencies) not already available in project
- Never stage changes or commit unless explicitely told to

### TESTING

- Use available test tools
- Always test, never assume work
- If no test tools, ask user if skip
- `npm run build` and `npm run lint` and `npm run format` must pass

### SPEC WRITING

- Spec unit is `docs/specs/NNN-name/NNN-name.md`; follow the rules in `docs/specs/SPEC-SAMPLE.md`.

### DESIGN

- `DESIGN.md` is the sole source of truth for styling and is self-sufficient — follow it strictly, including its `## Agent usage` and `## Accessibility` sections. If other output conflicts with it, `DESIGN.md` wins. Never edit it in feature tasks unless explicitly asked by the user.

---

## Tech Stack

- **Languages**: TypeScript 6.x, JSX, HTML5 / CSS3
- **Framework**: Preact 10.x
- **Build Tool**: Vite 8.x
- **Linting & Formatting**: `@biomejs/biome` 2.5.x
- **Types**: `@types/node` 24.x

---

## Testing Strategy

- Unit = pure logic (`*.test.ts`); integration = `*.test.tsx` colocated with component, run in browser mode with real CSS (headless Chromium via `@vitest/browser-playwright`); no E2E suite; manual visual checklist + MCP driving cover design polish.
- Conventions: colocated `src/components/*/*.test.tsx` + `src/App.test.tsx`; one `render` per test; accessible-query priority `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByAltText` with `toBeVisible` / text assertions by default; ban `getByTestId`, `container.querySelector`, id/class selectors except as documented last resort. `getComputedStyle` only for guards: SearchBar focus, App desktop shell, App rotated override.
- Setup: `src/test-setup.ts` imports `./globals.css`, mirroring `src/main.tsx`, so computed-style guards assert production CSS; `vite.config.ts` uses `defineConfig` from `vitest/config`.
- Naming: test descriptions are product-oriented or tied to a technical necessity, always meaningful (never bare `renders X` statements).
- Axe (`axe-core`, run directly — `vitest-axe` is Node-only and cannot run in browser mode) checks at App level only, 3 viewports: mobile `390x844`, rotated screens `844x390`, desktop `1280x800`.
- Failure-only screenshots via Vitest's built-in `screenshotFailures` in gitignored `.vitest/attachments/failure-screenshots/`. No custom hook.
- Agent loop: run single file (`npm run test -- <name>`), read text diff first, open `.vitest/attachments/failure-screenshots/` png only if diff is ambiguous. No screenshot-update workflow. `npm run build` + `npm run lint` + `npm run format` + `npm run test` must pass.
