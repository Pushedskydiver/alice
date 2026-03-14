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

Print:
```
✓ Clancy is installed.
  Run /clancy:init to connect your {board} board and finish setup.
```

Do NOT run /clancy:init — Clancy owns its own wizard.

If the user mentioned interest in Planner or Strategist roles, add:
```
💡 During /clancy:init you can enable optional roles like Planner for ticket refinement.
```

Print: "Good luck."
