# 017 - Dependency update plan

# Why

Addressing security advisories and major upgrades available.
This plan upgrades in small steps, fixes security first, and keeps every package
on a version its peers support. Supported is better than newest.

# What

- The learner sees no change o the UI.
- The project keeps the same commands and the same test suite.
- The project ends with no known audit findings and a documented, reproducible
  set of dependency versions.
- What explicitly does NOT change in this spec: the visual design, the lesson
  prompt, the OpenRouter provider policy, the OAuth flow, routing, engine
  behavior, and test conventions.

# Baseline

Measured on 2026-11-14 with Node 24.21.0 and npm 11.19.0. Re-check before
starting. If the registry has moved, update this table first. Never silently
install a different target than the one written here.

## Available updates

| Package | Declared | Installed | Available | Kind | Step |
|---|---|---|---|---|---|
| `@fontsource/noto-sans-jp` | `^5.3.0` | 5.3.0 | 5.3.1 | patch | 1.1 |
| `@material-symbols/svg-400` | `^0.47.5` | 0.47.5 | 0.47.6, 0.49.0 | patch, major zero | 1.1, 4.7 |
| `@openrouter/sdk` | `^1.4.25` | 1.4.25 | 1.5.103 | minor | 1.3 |
| `@testing-library/preact` | `^3.2.4` | 3.2.4 | 3.2.6 | patch | 1.2 |
| `msw` | `^3.0.3` | 3.0.3 | 3.0.5 | patch | 1.2 |
| `axe-core` | `^4.13.0` | 4.13.0 | 4.14.0 | minor | 1.2 |
| `vitest-browser-preact` | `^1.1.0` | 1.1.0 | 1.1.1, 2.0.0 | patch, major | 1.2, 4.8 |
| `@types/node` | `^24.13.3` | 24.13.6 | 24.19.2, 26.6.6 | minor, major | 1.2, 4.6 |
| `vite` | `^8.3.0` | 8.3.0 | 8.3.8 | patch, security | 2.1 |
| `vitest` | `^5.0.2` | 5.0.2 | 5.1.0 | minor, security | 2.2 |
| `@vitest/browser` | `^5.0.2` | 5.0.2 | 5.1.0 | minor, security | 2.2 |
| `@vitest/browser-playwright` | `^5.0.2` | 5.0.2 | 5.1.0 | minor, security | 2.2 |
| `source-map-js` | transitive | 1.2.1 | 1.2.2 | patch, security | 2.3 |
| `preact` | `^10.29.8` | 10.29.8 | 11.2.0 | major | 3.2 |
| `playwright` | `^1.63.0` | 1.63.0 | 1.65.1 | minor | 4.4 |
| `@biomejs/biome` | `^2.5.14` | 2.5.14 | 2.6.7 | minor | 4.5 |
| `typescript` | `~6.0.2` | 6.0.3 | 7.0.2 | major | 4.2 |
| Node | n/a | 24.21.0 | 26.13.1 LTS | runtime major | 4.3 |

No change is planned for `@preact/preset-vite` 2.10.6 or `preact-iso` 2.12.2.
Both are already the latest and both support Preact 11.

## Audit findings

| Advisory | Severity | Affected | Fixed by | Step |
|---|---|---|---|---|
| `GHSA-587h-7wmj-h5pm` | high | `vite` 8.3.0 to 8.3.2 | 8.3.8 | 2.1 |
| Five more `vite` advisories | moderate to low | `vite` 8.3.0 to 8.3.2 | 8.3.8 | 2.1 |
| `GHSA-68fv-2mgg-jv7q` | high | `source-map-js` 1.0.0 to 1.2.1 | 1.2.2 | 2.3 |
| `GHSA-p458-7748-mcp3` | moderate | `@vitest/browser`, `@vitest/ui` 5.0.0-beta.6 to 5.0.4 | 5.1.0 | 2.2 |
| `GHSA-qxg6-89mg-rqv8` | moderate | `@vitest/mocker` 5.0.0-beta.1 to 5.0.2 | 5.1.0 | 2.2 |
| `GHSA-xp26-3454-mjgp` | moderate | `@vitest/mocker` 5.0.0-rc.2 to 5.0.2 | 5.1.0 | 2.2 |
| Inherited by `@vitest/browser-playwright` | moderate | 5.0.0-beta.1 to 5.0.4 | 5.1.0 | 2.2 |

Summary: 7 total, 2 high, 5 moderate, 0 critical. `npm audit --omit=dev` reports
0, so the production tree is clean. All findings are in development and test
tooling.

`npm audit fix --dry-run` would also move `rolldown`, `postcss`, `nanoid`,
`@rolldown/pluginutils`, `@rolldown/binding-linux-x64-gnu`, and
`@oxc-project/types`. This plan prefers targeted moves: Vite and the Vitest
family are direct, and `source-map-js` is updated in place. Unrelated transitive
churn is accepted only if the targeted update cannot resolve the advisory. The
dry run does not move the Vitest family, so step 2.2 installs it explicitly.

## Preact 11 compatibility evidence

| Package | Installed | Peer range | Supports Preact 11 |
|---|---|---|---|
| `preact-iso` | 2.12.2 | `>=10` or `>=11.0.0-0` | yes |
| `vitest-browser-preact` | 1.1.1 | `^10.0.0` or `^11.0.0-0` | yes |
| `vitest-browser-preact` | 2.0.0 | `^10.0.0` or `^11.0.0-0` | yes |
| `@testing-library/preact` | 3.2.6 | `>=10` | yes |
| `@preact/preset-vite` | 2.10.6 | depends on `@prefresh/vite` `^2.4.11` (installed 2.4.12), peer `^10.4.0` or `^11.0.0-0` | yes |
| `preact-render-to-string` | 6.8.0 | Preact 11 peer `>=6.7.0` | yes |
| TypeScript | 6.0.3 | Preact 11 minimum 5.1 | yes |
| Vite | 8.3.8 | Preact 11 is ESM only; Vite build is ESM | yes |

Source scan for Preact 11 removals:

- `src/main.tsx:14` calls `render(<App />, app)` with two arguments. The removed
  third argument is not used.
- No `SuspenseList`, `Component.base`, `defaultProps`, `preact/compat`,
  `JSX.*` imports, numeric inline styles, or `useRef()` without an initial
  value.
- Refs use named props: `actionRef`, `triggerRef`, `dialogRef`, and
  `closeButtonRef`. `createRef` is used in tests. Default ref forwarding is not
  expected to change behavior, but `RefObject<T>` types may need `| null`.
- `useEffect` cleanup now runs after paint. The first suites to watch are
  `src/pages/LoadingPage/useRotatingCaption.test.ts:129` and
  `src/pages/LoadingPage/useLoadingPage.test.tsx:86`, which assert around
  unmount.

# Constraints

- Follow `AGENTS.md`, `docs/ARCHITECTURE.md`, and `DESIGN.md`. `DESIGN.md` is
  never edited.
- No new dependency, no CDN, and no external service. `npm-check-updates` runs
  through `npx` and is not added to the project.
- No `npx npm-check-updates -u`, no `npm install --force`, no
  `--legacy-peer-deps`, no `npm audit fix --force`, and no hand-edited
  `package-lock.json`.
- Supported beats newest. Before a major upgrade, check the target package's
  peer ranges and engines. If a dependency does not support the target, keep the
  highest mutually supported version and record the hold. Do not add
  `overrides` to hide a peer conflict.
- One step is one install command. Coupled packages move as one step only when
  their peer contract requires the same version: the three Vitest packages.
  Every step ends with the gate defined here. No second step runs without a
  green gate in between.
- Security outranks order. If a critical advisory appears mid-plan, pause the
  sequence and fix it immediately.
- Gate, in order: `npm run format`, `npm run lint`, `npm run build`, and
  `npm run test`. Run it through the `testing` subagent. A clean pass is
  reported as one summary line. A failure is re-run untruncated with the full
  stack. `git diff --stat` must show only intended files. Never carry a red step
  into the next step.
- Tests stay offline. No live OpenRouter request. A live smoke test needs
  explicit approval and exactly one request.
- Product code changes are limited to compatibility fixes required by an
  upgrade. No feature work, no refactor, and no styling change.
- Node is pinned in `.nvmrc` and `engines.node`. This is configuration, not a
  new dependency.
- The Vitest family is pinned exact because its peer contract is exact. Other
  package ranges keep the repo style: `^`, and `~` for TypeScript.
- If a step fails, fix or revert that step only. Do not stack a second upgrade
  on a red tree.
- No staging and no commit unless explicitly asked.

# Tasks

## Task 0 - Prove the starting point

- [x] Confirm the tree and runtime are clean. `git status --short` is empty,
      `node -v` is v24.21.0, and `npm -v` is 11.19.0. Stop if not.
- [x] Run `npm ci`. Run `npm run format`, then `git diff --exit-code`. Then run
      `npm run lint`, `npm run build`, and `npm run test`. If the baseline is
      red, stop. No dependency change starts on a red tree.
- [x] Re-run `npx npm-check-updates`, `npm outdated`, `npm audit`, and
      `npm audit --omit=dev`. Confirm this Baseline section. If a target moved,
      update this spec before installing. Do not silently take a different
      version.
- [x] Keep a step ledger with date, step, from, to, and gate result. The ledger
      can live in the work notes; no new repo file is required.

## Task 1 - Low-risk patch and minor bumps

### 1.1 Content and icon patches

- [x] Run `npm install @fontsource/noto-sans-jp@^5.3.1 @material-symbols/svg-400@^0.47.6`.
- [x] Gate.
- [x] Check landing typography and the settings and close icons in the browser.

### 1.2 Test-tooling patches

- [x] Run `npm install -D @testing-library/preact@^3.2.6 msw@^3.0.5 axe-core@^4.14.0 vitest-browser-preact@^1.1.1 @types/node@^24.19.2`.
- [x] Gate. Type-only fix: `renderHook` in `@testing-library/preact` 3.2.6
      requires the wrapper to accept optional children, so
      `TanukiKanjiProviderProps.children` became `children?: ComponentChildren`
      in `src/hooks/useTanukiKanjiServices.tsx`.
- [x] Confirm axe at 390x844, 844x390, and 1280x800 is still clean. If axe 4.14
      adds a rule that flags an existing issue, fix the accessibility issue.
      Do not disable the rule.

### 1.3 OpenRouter SDK minor

- [x] Run `npm install @openrouter/sdk@^1.5.103`.
- [x] Gate. No live call.
- [x] Confirm the engine adapter tests still pin the request shape and the
      session-key behavior.

## Task 2 - Security fixes, one advisory family at a time

### 2.1 Vite high advisories

- [x] Run `npm install -D vite@^8.3.8`.
- [x] Gate.
- [x] Run `npm audit`. The six Vite advisories must be gone. Record whether
      `source-map-js` remains. Result: audit dropped from `2 high + 5 moderate`
      to `5 moderate`; both high advisories are gone. `source-map-js` moved to
      `1.2.2` (via `postcss` under Vite), so its high advisory is resolved and
      Task 2.3's install can be skipped.

### 2.2 Vitest moderate advisories

- [x] Run `npm install -D --save-exact vitest@5.1.0 @vitest/browser@5.1.0 @vitest/browser-playwright@5.1.0`.
      Note: the single command hit `ERESOLVE` on the coupled peer group
      (`@vitest/browser@5.1.0` peers `vitest@5.1.0`, while the old lock still
      held 5.0.2). Resolved without `--force` or `--legacy-peer-deps` by
      removing the three old packages with `npm uninstall -D` and then running
      the install command. This deviates from the one-install-command rule:
      both commands ran inside this same step, with no gate between them, as the
      removal and install halves of one coupled set. All three landed at exact
      `5.1.0`.
- [x] Run `npm ls vitest @vitest/browser @vitest/browser-playwright @vitest/ui @vitest/mocker`. All resolve to 5.1.0.
- [x] Gate.
- [x] Run `npm audit`. The Vitest advisories must be gone. Result: `npm audit`
      reports `0` total.
- [x] If the browser provider fails only because Playwright 1.63 is too old,
      move Playwright to `^1.65.1` here, gate, and mark step 4.4 as done. Do not
      force Vitest. Result: not needed. Browser tests passed on Playwright
      `1.63.0`, so step 4.4 stays open.

### 2.3 source-map-js high advisory

- [x] If 2.1 already resolved `source-map-js` to 1.2.2, skip this install and
      record it. Otherwise run `npm update source-map-js` and check
      `npm ls source-map-js`. Result: skipped. `source-map-js` is `1.2.2`
      (`vite@8.3.8` -> `postcss@8.5.33` -> `source-map-js@1.2.2`).
- [x] If it stays at 1.2.1, run `npm audit fix` without `--force` and accept
      only the minimal transitive changes it needs. Review
      `git diff package.json` and stop if a direct dependency moved. Do not add
      an override. Result: not applicable, it is `1.2.2`; no audit fix and no
      override were needed.
- [x] Gate.

### 2.4 Audit closeout

- [x] `npm audit` reports 0. `npm audit --omit=dev` reports 0. Result: both
      report `0` total (`info 0, low 0, moderate 0, high 0, critical 0`).
- [x] If an advisory has no fix, stop and ask. Do not suppress it, omit the
      package, or force a resolution. Result: not applicable, no advisories
      remain.

## Task 3 - Preact 11

### 3.1 Preflight, no install

- [x] Re-check the Preact 11 compatibility table. If any peer range excludes
      Preact 11, stop and keep `preact` 10.29.8. Record the blocker. Result:
      every installed peer range accepts Preact 11 (`preact-iso` >=10 ||
      >=11.0.0-0, `vitest-browser-preact` ^10 || ^11.0.0-0,
      `@testing-library/preact` >=10, `@prefresh/vite` ^10.4 || ^11.0.0-0,
      `preact-render-to-string` >=10 || >=11.0.0-0). No blocker.
- [x] Confirm TypeScript is at least 5.1. Result: `typescript@6.0.3`.
- [x] Run the source scan from Baseline. If a removed API appears, fix it with
      Preact 10 still installed, gate, then continue. Result: no `SuspenseList`,
      `Component.base`, `defaultProps`, `preact/compat`, `JSX.*` import,
      numeric inline style, or no-argument `useRef()`; `src/main.tsx:14` uses
      the two-argument `render`. Nothing to fix before the install.
- [x] Confirm `preact-render-to-string` resolves to 6.8.0 or newer. Preact 11
      needs at least 6.7.0. Keep it transitive. Result: `6.8.0`, auto-installed
      as a top-level peer (`peer: true`) for `preact-iso@2.12.2` and Preact's
      optional peer; it is not a direct dependency.

### 3.2 Install Preact 11

- [x] Run `npm install preact@^11.2.0`. Result: installed `preact@11.2.0`,
      deduped across `preact-iso`, `@testing-library/preact`,
      `vitest-browser-preact`, `@prefresh/*`, and `preact-render-to-string`.
      `npm audit` reported 0.
- [x] If npm reports a peer conflict, do not force. Restore `package.json` and
      the lock, record the blocker, and stop. Result: not applicable, npm
      reported no peer conflict; nothing was forced.
- [x] Gate. Result: combined with 3.3 because the install surfaces only the
      expected `RefObject` type fallout. After the 3.3 fixes, `format`, `lint`,
      `build`, and `test` are green (51 test files, 420 tests).

### 3.3 Fix Preact 11 fallout

- [x] TypeScript: `RefObject<T>` now describes `current: T`. Update
      `src/components/Navbar/Settings/SettingsTrigger.tsx:15`,
      `src/components/Navbar/Settings/SettingsDialog.tsx:7-8`, and the settings
      views only if `tsc` reports. Use `RefObject<T | null>` where the ref
      starts null. Keep runtime refs unchanged. Result: `tsc` reported the
      three named files plus `SettingsContent.tsx`,
      `DisconnectedSettings.tsx`, and `useIMECompositionGuard.ts`; all six now
      declare `RefObject<T | null>`. Runtime refs are untouched.
- [x] Ref forwarding: named ref props are used, so no behavior change is
      expected. If a test fails because `ref` now lands on a DOM node, fix the
      component or test with accessible queries. Never use `getByTestId`.
      Result: no ref-related failure; no test query changed.
- [x] `useEffect` cleanup is deferred after paint. Watch
      `src/pages/LoadingPage/useRotatingCaption.test.ts:129` and
      `src/pages/LoadingPage/useLoadingPage.test.tsx:86`. If they assert
      synchronously after unmount, await or flush effects. Do not change
      product timing. Result: `useRotatingCaption` already passes because its
      fake timers flush the deferred cleanup. `useLoadingPage` failed its "late
      resolve after unmount" case; the test now awaits
      `waitForDeferredCleanup` (one frame plus the queued macrotask, with a
      timeout fallback) after `unmount()`. Product timing is unchanged; the
      accepted consequence is that the unmount cancellation window is now one
      frame plus a macrotask wider than under Preact 10.
- [x] ESM only: no CommonJS import. If a Preact subpath import fails, use the
      ESM path. Do not add a polyfill. Result: no CommonJS import and no failed
      subpath; no polyfill added.
- [x] No numeric inline styles, `defaultProps`, `JSX` namespace, or
      `SuspenseList`. No change is expected. Result: none present.
- [x] Gate. Result: `format`, `lint`, `build`, and `test` all green; 51 test
      files, 420 tests.

### 3.4 Manual check

- [x] Run `npm run dev`. Check the landing page, search bar IME composition,
      loading rings, result page, settings modal open, close, Escape, backdrop,
      and focus, and the OpenRouter connect and disconnect UI at 390x844,
      844x390, and 1280x800. No live call. Result: 34 automated Playwright
      checks (11 per viewport plus a default-motion desktop check), all
      passing, with screenshots in
      `/tmp/opencode/manual-3-4/`. The dev server ran with a fake dev key so the
      connected UI was available. Lesson requests were held in the browser and
      fulfilled with a stub; authorization navigations were answered locally;
      two requests per viewport were intercepted and none was sent to
      OpenRouter. The connect action was exercised through to its PKCE
      authorization URL, and the disconnect action through to the connect UI.
      Focus placement after open and after disconnect, the close button,
      Escape, and backdrop dismissal were exercised. A separate default-motion
      check observed 7 running CSS animations and differing frames on the
      loading page; the other screenshots use reduced motion.

### 3.5 Fallback

- [x] If 11.2.0 fails, try 11.1.1, then 11.0.2, with a gate each. If all fail,
      restore 10.29.8 and record the blocker. Do not force. Result: not
      applicable, 11.2.0 passed its gate.

### 3.6 Docs

- [x] Update `AGENTS.md` Tech Stack from Preact 10.x to Preact 11.x. Do not
      edit `DESIGN.md`. Result: `AGENTS.md` now says Preact 11.x; `DESIGN.md`
      is untouched.

## Task 4 - Ordered remaining upgrades

### 4.1 Vite checkpoint

- [x] Check the latest Vite. If a newer 8.x exists, install it and gate. If
      Vite 9 exists, proceed only if Vitest, `@preact/preset-vite`, and
      `@vitest/browser-playwright` peer ranges support it. Otherwise hold. At
      spec time, 8.3.8 is latest, so this is a no-op. Result: still a no-op.
      `npm view vite dist-tags` reports `latest: 8.3.8`, matching the installed
      `vite@8.3.8`; there is no published 9.x. The current peer ranges would
      hold anyway: `vitest@5.1.0` accepts `^6.4.0 || ^7.0.0 || ^8.0.0` and
      `@preact/preset-vite@2.10.6` accepts `2.x` through `8.x`
      (`@vitest/browser-playwright@5.1.0` peers on `vitest` and `playwright`).
      No install. Gate: `format`, `lint`, `build`, and `test` green; 51 test
      files, 420 tests.

### 4.2 TypeScript 7

- [x] Run `npm install -D typescript@~7.0.2`. Result: installed
      `typescript@7.0.2`; `npm audit` reports 0. Node 24.21.0 satisfies the
      package engine (`>=16.20.0`).
- [x] Gate. Fix config or code without relaxing strictness. If a required peer
      blocks it, restore `~6.0.3` and record the blocker. Result: no config or
      code changes were needed. `tsc -b --force` rebuilt both projects cleanly,
      then `format`, `lint`, `build`, and `test` passed (51 test files, 420
      tests). The peer branch was not needed: the only TypeScript peer is
      `msw@3.0.5` -> `>=5.9.x`, which 7.0.2 satisfies. TypeScript 7 ships only
      the native `tsc` binary: there is no `tsserver` and no JavaScript
      compiler API (`typescript` exports only its version). Nothing in this
      repo or its editor config depends on either. The platform binary is an
      `optionalDependency`, so `npm ci --omit=optional` would break `tsc`; keep
      optional dependencies installed in Task 4.3.
- [x] Update `AGENTS.md` Tech Stack from TypeScript 6.x to 7.x. Result:
      `AGENTS.md` now says TypeScript 7.x.

### 4.3 Node 26 LTS

- [x] Install Node 26.13.1 LTS locally. `node -v` must match. Result:
      installed with nvm; `nvm exec 26.13.1 node -v` reports `v26.13.1`
      (npm `11.20.0`). The existing `default -> lts/*` alias now resolves to
      26.13.1 (it resolved to 24.21.0 before); no alias was edited.
- [x] Add `.nvmrc` with `26.13.1`. Add `"engines": { "node": ">=26.13.1" }` to
      `package.json`. Result: `.nvmrc` contains `26.13.1`; `package.json` has
      `engines.node >= 26.13.1`.
- [x] Run `npm ci` under Node 26. No `EBADENGINE` warning is allowed. Result:
      `nvm exec 26.13.1 npm ci` exited 0, installed 205 packages, audit 0, and
      printed no `EBADENGINE` or unsupported-engine warning. Optional
      dependencies were installed, so the TypeScript platform binary is present.
- [x] Gate. Result: under Node `26.13.1`, `format`, `lint`, `build`, and `test`
      passed (51 test files, 420 tests), with no `EBADENGINE` output.
- [x] Update `AGENTS.md` Tech Stack to Node 26.x. Result: added
      `- **Runtime**: Node.js 26.x` to the Tech Stack.

### 4.4 Playwright

- [ ] Run `npm install -D playwright@^1.65.1`. Run `npx playwright install chromium`.
- [ ] Gate. If it fails, try 1.64.1 to isolate. If it still fails, restore
      1.63.0 and record the blocker.

### 4.5 Biome

- [ ] Run `npm install -D @biomejs/biome@^2.6.7`.
- [ ] Update `biome.json` `$schema` to
      `https://biomejs.dev/schemas/2.6.7/schema.json`.
- [ ] Run `npm run format` and `npm run lint`. Fix code, or run
      `npx biome migrate --write` only for config renames, and review the diff.
      Do not disable recommended rules without asking.
- [ ] Gate.
- [ ] Update `AGENTS.md` Tech Stack from Biome 2.5.x to 2.6.x.

### 4.6 `@types/node` 26

- [ ] Run `npm install -D @types/node@^26.6.6`.
- [ ] Gate.
- [ ] Update `AGENTS.md` Tech Stack from `@types/node` 24.x to 26.x.

### 4.7 Material Symbols 0.49

- [ ] Run `npm install @material-symbols/svg-400@^0.49.0`.
- [ ] Gate. If an icon import fails, try `^0.48.3`. If it still fails, hold at
      `^0.47.6` and record the missing icon name.
- [ ] Check the settings, close, connected, and alert icons.

### 4.8 `vitest-browser-preact` 2

- [ ] Run `npm install -D vitest-browser-preact@^2.0.0`.
- [ ] Gate. If it fails, restore `^1.1.1` and record the blocker.

### 4.9 Remaining sweep

- [ ] Run `npx npm-check-updates`, `npm outdated`, and `npm audit`. Apply the
      remaining patch and minor updates in one batch and gate.
- [ ] For each remaining major, run the peer check first. Proceed only if it is
      supported. Otherwise record a hold.
- [ ] Do not use `npx npm-check-updates -u`.

## Task 5 - Closeout

- [ ] `npm audit` reports 0. `npm audit --omit=dev` reports 0.
- [ ] Final gate.
- [ ] `npm run build` produces `dist/`. Run `npm run preview` for a short smoke
      check if useful.
- [ ] Update `AGENTS.md` Tech Stack for every changed version: Preact,
      TypeScript, Vite, Biome, `@types/node`, and Node. Do not edit
      `DESIGN.md`.
- [ ] Review `git diff --stat`. Only `package.json`, `package-lock.json`,
      `biome.json`, `.nvmrc`, `AGENTS.md`, and compatibility fixes should
      appear. No unrelated formatting churn.
- [ ] Report every held package, its blocker, and the highest supported
      version.
- [ ] Do not stage and do not commit.

# Acceptance

- `npm audit` reports 0 and `npm audit --omit=dev` reports 0.
- Every step in the ledger has a green gate.
- Final versions match the target table or a documented hold. No package was
  forced past a peer range.
- The app behaves identically: landing, search bar, loading, result, settings,
  and OpenRouter screens at 390x844, 844x390, and 1280x800. Axe stays clean.
- `npm ci` works from the lockfile and `npm run build` succeeds.
- No `--force`, `--legacy-peer-deps`, `npm audit fix --force`, or `overrides`
  entry was used to hide a conflict.
- `package-lock.json` was written only by npm.
- `AGENTS.md` Tech Stack matches the installed versions.
- Nothing is staged or committed.
