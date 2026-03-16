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

Next steps:
  1. Run /paul:map-codebase to scan your codebase
  2. Run /paul:init to configure planning rules
  3. Describe a feature — PAUL will plan before coding

Docs: https://github.com/ChristopherKahler/paul
```

If greenfield:
```
✓ PAUL is installed.

Next steps:
  1. Run /paul:init to configure planning rules
  2. Describe a feature — PAUL will plan before coding

Docs: https://github.com/ChristopherKahler/paul
```

Print: "Good luck."
