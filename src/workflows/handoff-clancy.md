# Clancy Handoff

## Pre-checks

- Determine if Alice was installed globally or locally
- Match the install location for Clancy

## Install

Run the following command (confirm with user first):

- **Local:** `npx chief-clancy --local`
- **Global:** `npx chief-clancy --global`

Wait for install to complete.

## Post-install

If existing project:
```
✓ Clancy is installed.

Next steps:
  1. Run /clancy:init to connect your {board} board
  2. Run /clancy:map-codebase to scan your codebase
  3. Start with /clancy:once to pick up your first ticket

Docs: https://ghuntley.com/ralph/
```

If greenfield:
```
✓ Clancy is installed.

Next steps:
  1. Run /clancy:init to connect your {board} board
  2. Start with /clancy:once to pick up your first ticket

Docs: https://ghuntley.com/ralph/
```

If the user mentioned interest in Planner or Strategist roles, add:
  💡 During /clancy:init you can enable optional roles like Planner for ticket refinement.

Confirm before running any suggested command.

Print: "Good luck."
