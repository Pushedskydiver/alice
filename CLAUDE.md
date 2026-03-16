# Alice — Project Guide

Alice is a Claude Code slash command installer and AI coding agent launcher. It helps developers discover and switch between specialised AI coding agents. Alice is a pure launcher — it ships no agent code, only the installer, registry, and handoff logic.

**npm package:** `alice-agents`
**Install:** `npx alice-agents`

## Key paths

- `src/installer/` — CLI entry point and installer modules (`install/`, `paths/`, `hooks/`, `ui/`, `clean/`, `errors/`)
- `src/prompts/` — Interactive prompts (`prompts.ts`)
- `src/commands/` — Slash command Markdown files: `init.md`, `update.md`, `uninstall.md`, `help.md`
- `src/workflows/` — Workflow Markdown files: `init.md`, `uninstall.md`, `handoff-*.md`
- `src/schemas/` — Zod schemas (`agent.ts`) — single source of truth for validation and types
- `src/types/` — Shared type definitions derived from schemas (`agent.ts`, `install.ts`)
- `src/utils/` — Shared utilities (`ansi/`, `fs/`, `ignore/`, `parse-json/`, `registry/`, `version/`)
- `registry/agents.json` — Declarative agent registry (JSON)
- `hooks/` — CommonJS hooks loaded by Claude Code (`alice-check-update.js`, `alice-context-monitor.js`)
- `dist/` — Build output (git-ignored)

## Slash commands

- `/alice:init` — Initial setup, install agents
- `/alice:update` — Update installed agents
- `/alice:uninstall` — Remove Alice's commands, workflows, and hooks
- `/alice:help` — Show help and available agents

## Scripts

| Command | Purpose |
|---|---|
| `npm test` | Run tests (Vitest) |
| `npm run dev` | Watch mode tests |
| `npm run test:coverage` | Tests with v8 coverage |
| `npm run build` | Compile TypeScript (tsc + tsc-alias) |
| `npm run typecheck` | Type check without emitting |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier format |
| `npm run validate:registry` | Validate registry/agents.json against zod schema |

## Commit format

Gitmoji + conventional commit:

```
<emoji> <type>(<scope>): <description>
```

Example: `feat(installer): add wizard`

## Key decisions

- **TypeScript ESM** — all source uses ESM (`"type": "module"`).
- **CommonJS hooks** — hooks are `.js` because Claude Code loads them with `require()`.
- **Registry-driven** — agents are declared in `registry/agents.json`, validated with zod/mini.
- **Pure launcher** — Alice contains zero agent implementation code.
- Use `type` not `interface` for type definitions.
- Co-locate tests (`*.test.ts`) next to source files.
- Use **npm**, not yarn or pnpm.
- Node.js 22+ required.
