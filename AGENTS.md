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

<TODO>
