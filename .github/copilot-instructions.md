# Alice - Copilot Instructions

## Overview

Alice is a Claude Code slash command installer and AI coding agent launcher. It helps developers discover, install, and switch between specialised AI coding agents within Claude Code sessions. Alice is a pure launcher — it contains no agent implementation code, only the installer, registry, and handoff workflows.

## Tech stack

- **Language:** TypeScript (strict mode, ESM)
- **Runtime:** Node.js 22+
- **Package manager:** npm (not yarn or pnpm)
- **Build:** tsc + tsc-alias
- **Test:** Vitest with globals enabled, v8 coverage
- **Lint:** ESLint + Prettier
- **Git hooks:** Husky + lint-staged

## Key conventions

- Use `type` over `interface` for type definitions.
- Co-locate tests next to source files as `*.test.ts`.
- Commit messages follow gitmoji + conventional commit format (e.g. `feat(installer): add wizard`).
- All source is ESM (`"type": "module"` in package.json).
- Hooks (`hooks/`) are CommonJS (`.js`) because Claude Code loads them via `require()`.
- Slash commands and workflows are Markdown files with `@`-syntax for cross-references.

## Key file paths

| Path | Purpose |
|---|---|
| `src/installer/` | CLI installer entry point |
| `src/prompts/` | Interactive prompts |
| `src/commands/` | Slash command Markdown files (init, update, help) |
| `src/workflows/` | Workflow Markdown files (agent handoffs) |
| `src/types/agent.ts` | Agent type definitions |
| `src/utils/` | Shared utilities (ANSI formatting, JSON parsing) |
| `registry/agents.json` | Declarative agent registry |
| `hooks/` | CommonJS hooks (session start, notifications) |
| `dist/` | Compiled output (git-ignored) |
