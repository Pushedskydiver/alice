# Alice Uninstall

## What this does

Removes everything Alice installed. This does **not** uninstall any agents (Clancy, GSD, PAUL) — only Alice's own files.

## Steps

### 1. Confirm with user

```
This will remove:
  • .claude/commands/alice/ (slash commands)
  • .claude/alice/workflows/ (workflow files)
  • Alice hook entries from .claude/settings.json
  • .claude/ entries from .gitignore, .prettierignore, .eslintignore (if added by Alice)

Any installed agents (Clancy, GSD, PAUL) will NOT be affected.

Proceed? (y/n)
```

If the user declines, stop.

### 2. Remove Alice files

Delete the following directories if they exist:
- `.claude/commands/alice/`
- `.claude/alice/`

### 3. Remove hook entries

Open `.claude/settings.json` and remove any hook entries whose `command` contains `alice-check-update` or `alice-context-monitor`.

If the `SessionStart` or `Notification` arrays become empty after removal, remove the empty arrays too.

### 4. Clean up ignore files

Remove the `.claude/` entry and the `# Added by Alice` comment from:
- `.gitignore`
- `.prettierignore` (if it exists)
- `.eslintignore` (if it exists)

Only remove entries that Alice added — identified by the `# Added by Alice` comment on the line above.

### 5. Confirm

```
✓ Alice uninstalled.
  Your agents are still installed — only Alice's launcher files were removed.
  "I'm not dead yet."
```
