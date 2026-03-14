# Contributing to Alice

Thanks for your interest in contributing to Alice! Here's how to get involved.

## Primary Contribution Surface

The main way to contribute is through the **agent registry** (`registry/agents.json`). Adding a new agent means adding a JSON entry to the registry and a handoff workflow.

Alice only launches external agents — do not add agent implementation code to this repo.

## Adding a New Agent

1. Add a JSON entry to `registry/agents.json` with all required fields
2. Create a handoff workflow in `src/workflows/handoff-{agent}.md`
3. Update the init workflow in `src/workflows/init.md` to include the new agent
4. Add a changelog entry

**Required fields** on every registry entry:

- `author` — who built the agent
- `url` — link to the agent's repo or homepage

PRs without these fields will not be merged. Credit is non-negotiable.

## Development Setup

```bash
git clone https://github.com/Pushedskydiver/alice.git
cd alice
npm install
npm test
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm test` | Run tests |
| `npm run dev` | Run tests in watch mode |
| `npm run build` | Build TypeScript |
| `npm run typecheck` | Type check without emitting |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Pull Requests

All PRs need:

- Description of the change
- Tested locally (`npm test`, `npm run typecheck`, `npm run lint`)
- Changelog entry in `CHANGELOG.md`

## Commit Format

Gitmoji + conventional commit:

```
<gitmoji> <type>(scope): description
```

Examples:

- `✨ feat(registry): add new agent`
- `🐛 fix(installer): handle missing directory`
- `📝 docs(readme): update agent comparison`

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.
