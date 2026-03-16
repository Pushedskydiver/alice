# Changelog

All notable changes to Alice are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [0.5.0] — 2026-03-16

### ✨ Features

- **`--reinstall` flag** — remove existing Alice files and install fresh, useful for corrupted installs or upgrades
- **Richer handoff summaries** — numbered next steps with docs links for Clancy, GSD, and PAUL
- **Registry guide** — `REGISTRY.md` with field documentation, examples, and submission checklist
- **Agent submission PR template** — structured checklist for community agent contributions

### ♻️ Refactoring

- **Split installer into focused modules** — `paths.ts`, `hooks.ts`, `ui.ts`, `clean.ts`, `errors.ts` for better testability and maintainability

---

## [0.4.0] — 2026-03-16

### ✨ Features

- **Better error messages** — actionable hints for permission errors (suggests `--local` or checking ownership)
- **Cached update checks** — 24-hour cache avoids hitting npm on every session start; respects `CI` and `ALICE_NO_UPDATE_CHECK` env vars
- **Agent comparison matrix** — `/alice:help` now shows a feature comparison table for all agents
- **`yellow` ANSI helper** — for warning-level messages

---

## [0.3.0] — 2026-03-16

### ✨ Features

- **`--help` flag** — print usage information and exit
- **`--version` flag** — print version number and exit
- **`--dry-run` flag** — preview install actions without modifying the filesystem
- **Graceful Ctrl+C** — clean shutdown during interactive prompts
- **CI detection** — require explicit `--global` or `--local` in non-interactive environments

---

## [0.2.0] — 2026-03-14

### ✨ Features

- **Uninstall command** — `/alice:uninstall` removes commands, workflows, hooks, and ignore entries
- **Ignore file management** — installer adds `.claude/` to `.gitignore` (creates if missing), `.prettierignore`, and `.eslintignore` (only if they exist)
- Entries tagged with `# Added by Alice` for clean removal on uninstall

---

## [0.1.0] — 2026-03-14

### ✨ Features

- **Init wizard** — asks questions, recommends the right AI coding agent, hands off to install
- **Agent registry** — declarative JSON registry for Clancy, GSD, and PAUL
- **Installer** — `npx alice-agents` with global/local install, ASCII banner, hooks registration
- **Handoff workflows** — dedicated handoff logic for each agent
- **Update command** — check and install latest Alice version
- **Hooks** — update checker (SessionStart) and context monitor (Notification)
