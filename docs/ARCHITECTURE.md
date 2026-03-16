# Architecture

## Overview

Alice is a **pure launcher**. It contains no agent implementation code. Its job is to help developers discover, install, and hand off to specialised AI coding agents within Claude Code sessions.

The package ships slash commands, workflows, a declarative agent registry, and lightweight hooks. All agent behaviour lives outside Alice, in the agents themselves.

## Installer flow

1. **Entry point:** `npx alice-agents` runs `src/installer/install/install.ts`. The installer is split into focused submodules: `paths/` (directory resolution), `hooks/` (settings.json management), `ui/` (help/dry-run/banner), `clean/` (reinstall cleanup), and `errors/` (recovery hints).
2. **Prompt:** The installer asks the user which agents to install and gathers preferences via `src/prompts/prompts.ts`.
3. **Copy:** Slash command (`.md`) and workflow (`.md`) files are copied into the user's `.claude/` directory.
4. **Register hooks:** CommonJS hook scripts from `hooks/` are registered with Claude Code's hook system.

## Command and workflow pattern

Commands and workflows are plain Markdown files that Claude Code reads as slash command definitions.

- **Commands** (`src/commands/`): `init.md`, `update.md`, `uninstall.md`, `help.md` — these are the `/alice:init`, `/alice:update`, `/alice:uninstall`, and `/alice:help` entry points.
- **Workflows** (`src/workflows/`): `handoff-*.md` files that define how Alice hands control to a specific agent.

Files use `@`-syntax references (e.g. `@registry/agents.json`) to pull in data from other parts of the project at runtime.

## Agent registry

The registry (`registry/agents.json`) is a declarative JSON file listing available agents. Each entry contains the agent's name, description, capabilities, and install metadata.

This is the primary community contribution surface — adding a new agent means adding a JSON entry and a corresponding handoff workflow. See [REGISTRY.md](../REGISTRY.md) for field documentation and submission guidelines.

## Utilities

Shared utilities live in `src/utils/`, each in its own subfolder with co-located tests:

- **`ansi/`** — ANSI colour and style helpers (`red`, `green`, `bold`, `dim`, etc.)
- **`fs/`** — Filesystem helpers (`copyDir` for recursive directory copying)
- **`ignore/`** — Ignore file management (`addIgnoreEntries`, `removeIgnoreEntries`)
- **`parse-json/`** — Safe JSON parsing that returns `null` instead of throwing
- **`version/`** — Reads and validates the `version` field from `package.json`

Shared types live in `src/types/`:

- **`agent.ts`** — `Agent` and `AgentRegistry` type definitions
- **`install.ts`** — `InstallLocation` type (`'global' | 'local'`)

## Hooks

Hooks live in `hooks/` and are **CommonJS** (`.js`) because Claude Code loads them via `require()`.

They run on a best-effort basis and do not block the user session. Current hook events:

- **SessionStart:** Runs when a Claude Code session begins. Used for update checks and context setup.
- **Notification:** Runs when Claude Code sends a notification. Used for monitoring and context awareness.

## Handoff logic

When a user asks Alice to switch to an agent:

1. **Confirm:** Alice confirms the agent selection with the user.
2. **Install:** If the agent is not already installed, Alice installs it (copies commands, workflows, hooks).
3. **Post-install message:** Alice displays a summary of what was installed and how to invoke the new agent.

The handoff workflow Markdown file drives this entire sequence — Alice itself does not contain agent-specific logic.
