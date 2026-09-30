# Why

There is no automated testing for the moment, so no fast failure signal when coding.

# What

Add a render/integration testing layer with Vitest browser mode + Testing Library.
This covers integration tests only: isolated component render + `App` composition + a11y contract.
No unt tests since no logic yet, no E2E suite.

Goals are:

- `npm run test` fails fast with an actionable text diff
- CSS is really executed (headless Chromium), but `getComputedStyle` is limited to two guards only. Everything else is visible/text.
- Screenshot configuration only on failure for on-the-spot debugging aid
- Query priority enforces a11y-first practice: accessible queries only

# Constraints

- Follow `AGENTS.md` and `DESIGN.md` rules at all times; never modify `DESIGN.md` in this spec.
- No E2E suite: Playwright is only the Vitest browser provider under the hood + on-demand MCP driving.
- Testing deps are the single allowed exception to the no-new-dependency rule (needed for this layer). No other runtime deps, no CDN `<link>`.
- Query priority (strict): `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByAltText`. Ban `getByTestId`, `container.querySelector`, and id/class selectors except as a last resort documented inline, and never as the primary element lookup. Default pattern is accessible query + `toBeVisible` / text assertion. `getComputedStyle` is allowed for testing screens guards.
- No committed snapshots. Screenshots are failure-only, written to a gitignored folder (e.g. `test-results/`)
- Test files colocates with code: `src/components/<Name>/<Name>.test.tsx` next to `<Name>.tsx` + `<Name>.module.css`, and `src/App.test.tsx` next to `src/App.tsx`.
- Single default mobile viewport for all tests. No viewport matrix. Exception for only one desktop + axe check at `App` level.
- `npm run build` and `npm run lint` and `npm run format` and `npm run test` must all pass.

# Tasks

- [X] Task 1 — Testing setup (browser mode, no E2E)
  - [X] Install as devDependencies: `vitest`, `@vitest/browser`, `playwright`, `@testing-library/preact`, `@testing-library/jest-dom` (matchers only), `vitest-axe` (axe-core wrapper, App-level check only). Ensure compatibility of versions with other app packages.
  - [X] `vite.config.ts`: add `test.browser` block (`enabled: true`, `provider: playwright`, single `chromium` instance). Keep Vite app config untouched otherwise.
  - [X] `package.json`: add `"test": "vitest run --browser"` and `"test:watch": "vitest --browser"`.
  - [X] Install Chromium for the provider (`npx playwright install chromium`) and document it in README.md as a local one-time step.
  - [X] Invite in `README.md` to configure also the Playwright MCP server in user's agent config. Add playwright MCP server as recommandations in agents setup paragraph in `README.md`.
  - [X] Failure-only screenshot hook: `onTestFailed`-style hook calling `page.screenshot({ path: test-results/<file>-<test>.png })` via the `page` fixture from `@vitest/browser`
  - [X] Gate — `npm run test` runs (zero tests green) + `npm run build` + `npm run lint` green.

- [X] Task 2 — Docs and test conventions (agent harness)
  - [X] Fill `AGENTS.md` `## Testing Strategy` `<TODO>`: unit = pure logic; integration = `*.test.tsx` colocated with component, run in browser mode with real CSS; no E2E suite; manual visual checklist + MCP driving cover design polish.
  - [X] Document conventions: colocated `src/components/*/*.test.tsx` + `src/App.test.tsx`; one `render` per test; accessible-query priority above with `toBeVisible` / text assertions by default; `getComputedStyle` only for the three guards :SearchBar focus, App desktop shell, App rotated override; failure-only screenshots via Vitest's built-in `screenshotFailures` in gitignored `.vitest/attachments/failure-screenshots/`; `src/test-setup.ts` mirrors `src/main.tsx` by importing `./globals.css` so guards assert production CSS; `vite.config.ts` uses `defineConfig` from `vitest/config`; axe via `axe-core` directly at App level only, 3 viewports: mobile `390x844`, rotated screens `844x390`, desktop `1280x800`.
  - [X] Document test naming: descriptions are product-oriented or tied to a technical necessity, always meaningful (never bare `renders X` statements).
  - [X] Document agent loop: run single file (`npm run test -- <name>`), read text diff first, open `.vitest/attachments/failure-screenshots/` png only if diff is ambiguous. No screenshot-update workflow.

- [X] Task 3 — Navbar leaf integration test (`src/components/Navbar/Navbar.test.tsx`)
  - [X] Render isolated; `getByRole("banner")` header present and visible.
  - [X] `getByRole("navigation", { name: "Primary" })` present.
  - [X] Logo: `getByRole("img", { name: "Tanuki Kanji logo" })` with `width`/`height` attrs matching `ICON_XL_PX`; title `getByText("Tanuki Kanji")` visible.
  - [X] Gate — file green in `npm run test -- Navbar`.

- [X] Task 4 — Banner leaf integration test (`src/components/Banner/Banner.test.tsx`)
  - [X] `getByRole("heading", { level: 1 })` with pitch visible; section labelled via `aria-labelledby="banner-heading"` (`getByRole("region")` accessible name matches heading).
  - [X] Illustration: `getByRole("img", { name: /tanuki calligraphing/i })` with intrinsic `width`/`height` attrs; badge icon decorative (`aria-hidden`, no role).
  - [X] Caption `getByText(/unlock the secrets/i)` visible.
  - [X] Gate — file green in `npm run test -- Banner`.

- [X] Task 5 — SearchBar leaf integration test (`src/components/SearchBar/SearchBar.test.tsx`)
  - [X] Label association: `getByRole("textbox", { name: "Enter your kanji" })` resolves via `<label htmlFor>`; `placeholder` text content check.
  - [X] `getByRole("button", { name: "Submit search" })` present, `type="button"`, visible; counter `getByText(/\/ 21 chars/)` visible.
  - [X] Focus guard: focus the textbox via real user event, then assert the `.field` wrapper draws a single `2px primary` outline ring (`2px` offset) while the input itself carries no outline (one green line, never two, per `DESIGN.md`).
  - [X] Gate — file green in `npm run test -- SearchBar`.

- [X] Task 6 — Explanation leaf integration test (`src/components/Explanation/Explanation.test.tsx`)
  - [X] Section `getByRole("region", { name: "Why Etymology Works" })`; `getByRole("heading", { level: 2, name: "Why Etymology Works" })` visible.
  - [X] `getByRole("list")` with exactly 2 `getByRole("listitem")`; item headings `getByRole("heading", { level: 3, name: "Logical Radical Blocks" })` and `name: "Deep Cultural Folklore"`; body via `getByText` visible.
  - [X] Tag `getByText("Natural Memory")` visible; all item icons decorative (no `img` role).
  - [X] Gate — file green in `npm run test -- Explanation`.

- [X] Task 7 — Landing page composition test (`src/App.test.tsx`, colocated with `src/App.tsx`)
  - [X] Renders single `banner`, single `main`, single level-1 heading.
  - [X] Order contract: `navigation` before `banner` illustration before `textbox` before `explanation` region (assert via document order with `compareDocumentPosition`, not pixel positions).
  - [X] Desktop + rotated + axe checks (App level only, no per-leaf axe): desktop guard at `1280x800` (width-only `≥48rem` engagement) asserting `pageContent` computed `max-width` is `1120px` and centered plus the banner `contain` / `220px` cap; rotated guard at `844x390` asserting the short-viewport override restores the cover crop; then 3 `axe-core` checks on the composed `App` (mobile, rotated, desktop).
  - [X] Gate — full `npm run test` green (Tasks 3–7) + `npm run build` + `npm run lint` + `npm run format` green.

# Acceptance

- `npm run test` (browser, Chromium) green: 5 files (Navbar, Banner, SearchBar, Explanation, App).
- No Playwright E2E files, no committed snapshots; failure screenshots go to gitignored `.vitest/attachments/failure-screenshots/` (built-in `screenshotFailures`, no custom hook).
- `AGENTS.md` Testing Strategy documents the unit/integration/no-E2E split and the accessible-query + failure-only-screenshot loop.
- `npm run build` and `npm run lint` and `npm run format` pass; `DESIGN.md` untouched.
