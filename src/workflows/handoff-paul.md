# PAUL Handoff

## Pre-checks

- Determine if Alice was installed globally or locally
- Match the install location for PAUL
- Determine if this is an existing project or greenfield

## Install

Run the following command (confirm with user first):

- If Alice was installed **locally**: `npx paul-framework`
- If Alice was installed **globally**: `npx paul-framework`

Note: PAUL does not currently support `--local` / `--global` flags. The command is the same for both, but match the install location when advising the user about where files will be created.

Wait for install to complete.

## Post-install

If existing project:
```
✓ PAUL is installed.
  Run /paul:map-codebase to scan your codebase, then /paul:init to start.
```

If greenfield:
```
✓ PAUL is installed.
  Run /paul:init to start.
```

Confirm before running any suggested command.

Print: "Good luck."
