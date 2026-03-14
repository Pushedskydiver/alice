# Alice Init Wizard

> "I want to know what happened here."

## Step 1: Detect Project State

Before asking anything, scan the current directory silently.

### Existing project detection

Check for the presence of:
- `package.json`
- `.git`
- `src/`
- `app/`
- `lib/`

If **any** of these exist, this is an **existing project**. Note this for later.

If **none** exist, this is a **greenfield project**. Note this for later.

### Existing agent detection

Check for the presence of:
- `.clancy/`
- `.gsd/`
- `.paul/`
- `.planning/`

If **any** of these exist, an agent is already installed. Inform the user:

```
It looks like you already have an agent installed here.
- .clancy/ → Clancy
- .gsd/ → GSD
- .paul/ → PAUL
- .planning/ → PAUL (legacy)

You can re-run init to switch agents, but the existing agent's config will remain.
Proceed? (y/n)
```

If the user declines, stop.

---

## Step 2: Core Question

Ask:

```
How do you track work for this project?

1. Board (Jira, Linear, Trello, GitHub Projects, etc.)
2. Locally / no board
```

- If **1 (Board)** → Recommend **Clancy**. Go to Step 3 (Clancy follow-ups).
- If **2 (Local / no board)** → Go to Q2.

### Q2: What matters most?

Ask:

```
What matters most to you?

1. Speed — ship fast, minimal ceremony
2. Quality — structured plans, thorough reviews
3. Autonomous tickets — pull work from a board without manual input
```

- If **1 (Speed)** → Recommend **GSD**. Go to Step 3 (GSD follow-ups).
- If **2 (Quality)** → Recommend **PAUL**. Go to Step 3 (PAUL follow-ups).
- If **3 (Autonomous tickets)** → Recommend **Clancy**. Go to Step 3 (Clancy follow-ups).

> "This thing is learning. It's adapting."

---

## Step 3: Follow-ups

### Clancy follow-ups

Ask:

```
What board do you use?

1. Jira
2. GitHub Issues
3. Linear
4. Other
```

If the user selects **Other**, inform them:
"Clancy currently supports Jira, GitHub Issues, and Linear. You may need manual setup for other boards."

Store the answer as `{board}`.

### GSD follow-ups

Confirm the project type detected in Step 1:

```
Is this an existing codebase or a brand-new (greenfield) project?

1. Existing codebase
2. Greenfield
```

Store the answer as `{project_type}`.

### PAUL follow-ups

Confirm the project type detected in Step 1:

```
Is this an existing codebase or a brand-new (greenfield) project?

1. Existing codebase
2. Greenfield
```

Store the answer as `{project_type}`.

---

## Step 4: Agent Summary and Confirm

Present the recommended agent summary and ask for confirmation.

### Clancy Summary

```
Recommended agent: Clancy (Chief of Staff)

Clancy connects to your {board} board and manages the full ticket lifecycle:
- Pulls tickets from your board automatically
- Plans implementation based on your codebase
- Executes work in isolated branches
- Submits PRs and updates ticket status

Clancy works best when you have a board with tickets ready to go.
He handles the coordination so you can focus on direction.

Install Clancy? (y/n)
```

### GSD Summary

```
Recommended agent: GSD (Get Shit Done)

GSD is a lightweight, speed-first development agent:
- Minimal setup, maximum output
- Works from local task lists or inline instructions
- Ships code fast with pragmatic quality checks
- No board integration needed

GSD works best when you want to move fast and skip ceremony.
Point it at a problem and get out of the way.

Install GSD? (y/n)
```

### PAUL Summary

```
Recommended agent: PAUL (Planning, Architecture, Understanding, Learning)

PAUL is a structured development agent focused on quality:
- Creates detailed implementation plans before writing code
- Enforces architecture patterns and coding standards
- Reviews its own work against acceptance criteria
- Learns from your codebase to improve over time

PAUL works best when you care about maintainability and correctness.
He takes a little longer but the output is solid.

Install PAUL? (y/n)
```

If the user confirms, proceed to Step 5.

If the user declines, ask if they want to choose a different agent or exit.

---

## Step 5: Hand Off to Agent Installer

Based on the confirmed agent, hand off to the appropriate installer workflow:

- **Clancy** → Follow @.claude/alice/workflows/handoff-clancy.md
- **GSD** → Follow @.claude/alice/workflows/handoff-gsd.md
- **PAUL** → Follow @.claude/alice/workflows/handoff-paul.md

Pass along all collected context:
- `{board}` (Clancy only)
- `{project_type}` (GSD and PAUL only)
- Whether Alice is installed globally or locally
