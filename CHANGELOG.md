# Changelog

All notable changes to Alice are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [0.1.0] — 2026-03-14

### ✨ Features

- **Init wizard** — asks questions, recommends the right AI coding agent, hands off to install
- **Agent registry** — declarative JSON registry for Clancy, GSD, and PAUL
- **Installer** — `npx alice-agents` with global/local install, ASCII banner, hooks registration
- **Handoff workflows** — dedicated handoff logic for each agent
- **Update command** — check and install latest Alice version
- **Hooks** — update checker (SessionStart) and context monitor (Notification)
