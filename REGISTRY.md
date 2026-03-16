# Agent Registry Guide

## What is the registry?

`registry/agents.json` is the single source of truth for all agents Alice knows about. It drives the init wizard recommendations, handoff workflows, and help output. Every agent that Alice can install or recommend must have an entry in this file.

## Required fields

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique kebab-case identifier for the agent (e.g. `"clancy"`, `"gsd"`) |
| `name` | `string` | Human-readable display name |
| `description` | `string` | One-line summary of the agent's philosophy and approach |
| `author` | `string` | Who built the agent — credit is non-negotiable |
| `url` | `string` | Link to the agent's repo or homepage |
| `npm_package` | `string` | Published npm package name |
| `install_cmd` | `string` | The `npx` command used to install the agent |
| `requires_board` | `boolean` | Whether the agent requires a project board (Jira, GitHub, Linear, etc.) |
| `supports_existing_project` | `boolean` | Whether the agent works with an existing codebase |
| `supports_greenfield` | `boolean` | Whether the agent works for brand-new projects |

## Optional fields

| Field | Type | Description |
| --- | --- | --- |
| `supported_boards` | `string[]` | List of supported board providers (e.g. `["jira", "github", "linear"]`) |
| `has_roles` | `boolean` | Whether the agent supports multiple roles |
| `optional_roles` | `string[]` | List of optional roles the user can enable (e.g. `["planner", "strategist"]`) |
| `multi_runtime` | `string[]` | List of supported runtimes beyond Claude Code (e.g. `["claude", "opencode", "gemini", "codex"]`) |
| `init_slash` | `string` | Slash command to initialise the agent (e.g. `"/clancy:init"`) |
| `new_project_slash` | `string` | Slash command to start a new project (e.g. `"/gsd:new-project"`) |
| `map_codebase_slash` | `string` | Slash command to scan an existing codebase (e.g. `"/clancy:map-codebase"`) |

## Extended metadata fields

These optional fields improve discovery, filtering, and compatibility checks.

| Field | Type | Description |
| --- | --- | --- |
| `tags` | `string[]` | Searchable tags describing the agent's approach (e.g. `["board-driven", "autonomous"]`) |
| `min_node_version` | `string` | Minimum Node.js version required (e.g. `">=22.0.0"`) |
| `os_support` | `string[]` | Supported operating systems (e.g. `["macos", "linux", "windows"]`) |
| `deprecated` | `boolean` | Set to `true` to mark an agent as deprecated — Alice will warn users |
| `experimental` | `boolean` | Set to `true` for agents in early/preview stage — Alice will note this |

## Example entry

Below is Clancy's full entry from `registry/agents.json`:

```json
{
  "id": "clancy",
  "name": "Clancy",
  "description": "Autonomous, board-driven development with structured roles — built on the Ralph technique by Geoffrey Huntley",
  "author": "Ralph technique by Geoffrey Huntley — evolved and packaged as Clancy",
  "url": "https://ghuntley.com/ralph/",
  "npm_package": "chief-clancy",
  "install_cmd": "npx chief-clancy",
  "requires_board": true,
  "supported_boards": ["jira", "github", "linear"],
  "has_roles": true,
  "optional_roles": ["planner", "strategist"],
  "init_slash": "/clancy:init",
  "map_codebase_slash": "/clancy:map-codebase",
  "supports_existing_project": true,
  "supports_greenfield": true,
  "tags": ["board-driven", "autonomous", "ticket-execution", "roles"],
  "min_node_version": ">=22.0.0",
  "os_support": ["macos", "linux", "windows"],
  "deprecated": false,
  "experimental": false
}
```

## Validation

The registry is validated against a zod schema at build time and in CI. Run locally:

```bash
npm run validate:registry
```

This catches missing required fields, invalid formats (e.g. uppercase IDs, malformed URLs), and type mismatches before they reach production.

## Submission process

1. Fork the repo
2. Add your agent entry to `registry/agents.json`
3. Create a handoff workflow at `src/workflows/handoff-{id}.md`
4. Update `src/workflows/init.md` to include your agent in the decision tree
5. Add a changelog entry
6. Open a PR using the agent submission template

## Submission checklist

- [ ] Agent entry in `registry/agents.json` with all required fields
- [ ] `author` and `url` fields present (credit is non-negotiable)
- [ ] `npm_package` exists and is published on npm
- [ ] Handoff workflow created
- [ ] Tested locally (`npm test` passes)
- [ ] Changelog entry added
