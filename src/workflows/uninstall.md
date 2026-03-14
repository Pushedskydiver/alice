# Alice Uninstall

## What this does

Removes everything Alice installed. This does **not** uninstall any agents (Clancy, GSD, PAUL) — only Alice's own files.

## Steps

### 1. Determine install location

Check where Alice is installed:
- **Local:** `.claude/commands/alice/` exists in the current project directory
- **Global:** `~/.claude/commands/alice/` exists in the user's home directory

If both exist, ask the user which one to uninstall. Use the detected location for all subsequent steps.

### 2. Confirm with user

```
This will remove:
  • {target}commands/alice/ (slash commands)
  • {target}alice/workflows/ (workflow files)
  • Alice hook entries from {target}settings.json
  • .claude/ entries from .gitignore, .prettierignore, .eslintignore (if added by Alice, local only)

Any installed agents (Clancy, GSD, PAUL) will NOT be affected.

Proceed? (y/n)
```

Where `{target}` is `.claude/` (local) or `~/.claude/` (global).

If the user declines, stop.

### 3. Remove Alice files

Delete the following directories if they exist:
- `{target}commands/alice/`
- `{target}alice/`

### 4. Remove hook entries

Open `{target}settings.json` and remove any hook entries whose `command` contains `alice-check-update` or `alice-context-monitor`.

If the `SessionStart` or `Notification` arrays become empty after removal, remove the empty arrays too.

### 5. Clean up ignore files (local installs only)

Remove the `.claude/` entry and the `# Added by Alice` comment from:
- `.gitignore`
- `.prettierignore` (if it exists)
- `.eslintignore` (if it exists)

Only remove entries that Alice added — identified by the `# Added by Alice` comment on the line above.

Skip this step for global installs (ignore files are project-level, not global).

### 6. Confirm

```
✓ Alice uninstalled.
  Your agents are still installed — only Alice's launcher files were removed.
  "I'm not dead yet."
```
