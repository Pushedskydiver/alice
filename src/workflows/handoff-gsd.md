# GSD Handoff

## Pre-checks

- Determine if Alice was installed globally or locally
- Match the install location for GSD
- Determine if this is an existing project or greenfield

## Install

Run the following command (confirm with user first):

- **Local:** `npx get-shit-done-cc@latest --claude --local`
- **Global:** `npx get-shit-done-cc@latest --claude --global`

Wait for install to complete.

## Post-install

If existing project:
```
✓ GSD is installed.
  Run /gsd:map-codebase to scan your codebase, then /gsd:new-project to start.
```

If greenfield:
```
✓ GSD is installed.
  Run /gsd:new-project to start.
```

Confirm before running any suggested command.

Print: "Good luck."
