---
description: Update Alice to the latest version
---

# /alice:update

Check for and install the latest version of Alice.

## Steps

1. Read the current version from the installed Alice package:
   - Check `node_modules/alice-agents/package.json` or run `npm view alice-agents version`

2. Compare to the installed version

3. If already on latest:
   - Print: `✓ Alice is up to date (v{version})`
   - Print: `"I'm not dead yet."`

4. If update available:
   - Show: `🔄 Alice v{current} → v{latest} available`
   - Show changelog diff if possible
   - Confirm with user before proceeding
   - Run: `npx alice-agents@latest` (with same --global or --local flag as original install)

5. After update:
   - Print: `✓ Alice updated to v{latest}`
