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

### TESTING

- Use available test tools
- Always test, never assume work
- If no test tools, ask user if skip

### DESIGN

Always follow [DESIGN.md](./DESIGN.md) specifications.

---

## Tech Stack

- **Framework**: Preact 10.x
- **Build Tool**: Vite 8.x
- **Language**: TypeScript 6.x
- **Linting & Formatting**: `@biomejs/biome` 2.5.x
- **Types**: `@types/node` 24.x

---

## Testing Strategy

<TODO>