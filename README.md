# Tanuki Kanji

## Key Features

- **Type any Japanese word** — IME-aware kanji and kana composition up to 21 characters, checked as you type.
- **Accessible at every size** — mobile-first app, a11y practices and inclusive design philosophy.
- <TO_BE_COMPLETED>

## Development & Technical Guidelines

For complete details on the architecture, tech stack, security constraints, and coding guidelines, please refer to [AGENTS.md](./AGENTS.md).

### Recommended agents settings

- File `skills-lock.json` indicates recommended skill. I recommend finding them on [https://www.skills.sh/]
- I recommend scanning and populating an agent memory using the archives specifications in `./docs/specs/archive`.
  - Example of memory: `@pepk/mcp-memory-sqlite` NPM package
- Since the tests are using Playwright, I recommend adding the Playwright MCP server in your agent config to help your coding agent during tasks.

#### (Re) building fresh agent memory

Archived specs in `docs/specs/archive/` are ignored by LLM workspace indexing (`.ignore`) to avoid bloating agents' working memory. If you do not use local agent memory (like SQLite database) you can remove the `.ignore` instruction.
If you wanna (re)populate your local agent memory, tell your agent to specifically re-scan the archives.

Here is an example of prompt (might not use it "as-is", this is an example).

```md
# Prompt you can use
Re-read all archived specs in docs/specs/archive/ and re-ingest their learnings into your project's memory database.

1. Scan all `.md` files in `docs/specs/archive/`.
2. For each file, extract key decisions and call `create_entities` / `add_observations` using the `Project:<repo-name>:Spec-<Name>` schema.
3. Confirm memory restoration upon completion.
```

### Dev server

#### Remote access

By default this project is configured to not allow remote access.
However you can easily expose a local IP and DNS using this method :

- Create a `.env.development` file in your repository (will be ignored by default) and two variables
  - `VITE_ALLOWED_HOST_REMOTE_IP=a.b.c.d`
  - `VITE_ALLOWED_HOST_REMOTE_DNS=your.dns`
- then run the server using `npm run dev -- --host`

This will limit your dev server exposure to those entrypoints.

### OpenRouter key

Lessons use the key of the OpenRouter account connected in the app. Open the
navbar settings control and choose `Connect to OpenRouter`; the key lives in
tab memory only and disappears on reload. `Disconnect` forgets it locally, but
the key itself stays in the learner's OpenRouter account until it is revoked at
<https://openrouter.ai/keys>. A failed sign-in after OpenRouter created a key can
leave an unused key behind, which should be revoked there too.

For development you can skip the connection with a local key in your untracked
`.env.development` file:

- `VITE_OPENROUTER_API_KEY=sk-or-v1-your-key`

When the app starts in development with that key set, it connects the key as
the session straight away and opens in connected mode. `Disconnect` clears it
until the next reload, which connects it again. Production builds never read
this key, because the startup connection is gated on `import.meta.env.DEV`.

Three rules keep that local key harmless:

- **Localhost only** — the key is never committed (`.env.*` is gitignored, only `.env.example` is tracked).
- **Never ship a personal key in a build** — any `VITE_` variable is inlined into the bundle, so a build made with a key set ships that key to every visitor. The learner can connect their own OpenRouter account at runtime instead.
- **Harden the key in the dashboard** — set a spend limit, and a referer allowlist for the origin you serve the app from (`http://localhost:5173` by default). The app sends its own origin as its referer and `Tanuki Kanji` as its title, so the allowlist matches. Both bound what a leaked browser-visible key can cost; neither makes it secret.

### Testing

Integration tests run in real Chromium via Vitest browser mode (`npm run test`).
Outbound HTTP is fully intercepted by [MSW](https://mswjs.io/), so the suite never reaches the LLM provider.

One-time local setup:

```sh
npx playwright install chromium
```

## License

Please refer to the [LICENSE](./LICENSE) file for usage and distribution terms.
