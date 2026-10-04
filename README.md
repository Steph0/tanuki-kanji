# Tanuki Kanji

## Key Features

<TODO>

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

### Testing

Integration tests run in real Chromium via Vitest browser mode (`npm run test`).

One-time local setup:

```sh
npx playwright install chromium
```

## License

Please refer to the [LICENSE](./LICENSE) file for usage and distribution terms.
