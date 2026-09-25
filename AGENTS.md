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

### DESIGN

- `DESIGN.md` is the single source of truth for all styling decisions. If Stitch/other output conflicts with it, `DESIGN.md` wins. Never modify `DESIGN.md` during a feature task.
- Tokens are normative, prose is context: frontmatter (`colors`, `typography`, `rounded`, `spacing`, `components`) defines exact values; body sections explain how to apply them. Never hardcode colors, fonts, spacing, radii outside tokens.
- Global CSS by default: webapp-wide variables and base styles live in `src/index.css`. Component files (`src/components/*/*.module.css`, CSS Modules + native `var()`) only consume tokens via `var(--...)`. No per-component token redefinition.
- No external CDN `<link>` for fonts/icons
- `DESIGN.md` itself must stay valid per documentation hosted at [https://github.com/google-labs-code/design.md/blob/main/docs/spec.md]. Consult this documentation to validate any changes to `DESIGN.md`
- Mobile-first, always: base styles with no query = mobile. Desktop rules are variation of the base style.
- Maximum WCAG compliance (a11y)

---

## Tech Stack

- **Languages**: TypeScript 6.x, JSX, HTML5 / CSS3
- **Framework**: Preact 10.x
- **Build Tool**: Vite 8.x
- **Linting & Formatting**: `@biomejs/biome` 2.5.x
- **Types**: `@types/node` 24.x

---

## Testing Strategy

<TODO>
