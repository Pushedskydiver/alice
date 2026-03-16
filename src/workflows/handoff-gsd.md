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

Next steps:
  1. Run /gsd:map-codebase to scan your codebase
  2. Run /gsd:new-project to start your first task
  3. Describe what you want built — GSD handles the rest

Docs: https://github.com/glittercowboy/get-shit-done
```

If greenfield:
```
✓ GSD is installed.

Next steps:
  1. Run /gsd:new-project to scaffold your project
  2. Describe what you want built — GSD handles the rest

Docs: https://github.com/glittercowboy/get-shit-done
```

Confirm before running any suggested command.

Print: "Good luck."
