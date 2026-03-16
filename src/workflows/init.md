# Alice Init Wizard

> "I want to know what happened here."

## Step 1: Detect Project State

Before asking anything, scan the current directory silently. Collect all signals before presenting anything to the user.

### Existing project detection

Check for the presence of:
- `package.json`
- `.git`
- `src/`
- `app/`
- `lib/`

If **any** of these exist, this is an **existing project**. Note this for later.

If **none** exist, this is a **greenfield project**. Note this for later.

### Framework and language detection

If `package.json` exists, read it and check for:
- **TypeScript**: `tsconfig.json` exists or `typescript` in devDependencies
- **React**: `react` in dependencies
- **Next.js**: `next` in dependencies or `next.config.*` exists
- **Vue**: `vue` in dependencies or `nuxt` in dependencies
- **Svelte**: `svelte` in dependencies or `@sveltejs/kit` in dependencies
- **Express/Fastify**: `express` or `fastify` in dependencies
- **Monorepo**: `workspaces` field in `package.json`, or `pnpm-workspace.yaml` exists, or `lerna.json` exists

Additionally, always check for non-JS languages (these apply regardless of whether `package.json` exists — polyglot and monorepo setups are common):
- **Python**: `requirements.txt`, `pyproject.toml`, or `setup.py`
- **Go**: `go.mod`
- **Rust**: `Cargo.toml`
- **Java**: `pom.xml` or `build.gradle`

Similarly, **TypeScript** detection via `tsconfig.json` applies even without `package.json`.

### Git host detection

If `.git/config` exists, read it and check the remote URL:
- Contains `github.com` → **GitHub**
- Contains `gitlab.com` → **GitLab**
- Contains `bitbucket.org` → **Bitbucket**

### CI detection

Check for:
- `.github/workflows/` → **GitHub Actions**
- `.gitlab-ci.yml` → **GitLab CI**
- `.circleci/` → **CircleCI**
- `Jenkinsfile` → **Jenkins**

### Existing agent detection

Check for agent command directories (installed by the agents themselves):
- `.claude/commands/clancy/` → Clancy
- `.claude/commands/gsd/` → GSD
- `.claude/commands/paul/` → PAUL

Also check for legacy agent config directories (created by older agent versions):
- `.clancy/` → Clancy (legacy)
- `.gsd/` → GSD (legacy)
- `.paul/` or `.planning/` → PAUL (legacy)

If **any** of these exist, an agent is already installed.

---

## Step 1b: Present Detected Context

If this is an **existing project**, present a brief summary of what was detected:

```
I scanned your project. Here's what I found:

  {If framework detected}  Framework: {framework}
  {If language detected}   Language: {language}
  {If git_host detected}   Git host: {git_host}
  {If ci_provider detected}  CI: {ci_provider}
  {If monorepo detected}   Monorepo: yes
```

Only show lines where something was detected. Skip lines with no signal. If nothing beyond basic files was detected, skip this block entirely.

If an **existing agent** is detected, inform the user:

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

If **GitHub** was detected as the Git host, add a contextual hint:

```
How do you track work for this project?

1. Board (Jira, Linear, GitHub Issues, etc.)
2. Locally / no board

💡 Tip: Since your project is on GitHub, Clancy can connect directly to GitHub Issues.
```

Otherwise, ask without the hint:

```
How do you track work for this project?

1. Board (Jira, Linear, GitHub Issues, etc.)
2. Locally / no board
```

- If **1 (Board)** → Recommend **Clancy**. Go to Step 3 (Clancy follow-ups).
- If **2 (Local / no board)** → Go to Q2.

### Q2: What matters most?

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

If **GitHub** was detected as the Git host, pre-select GitHub Issues:

```
What board do you use?

1. Jira
2. GitHub Issues {If GitHub detected: ← detected}
3. Linear
4. Other
```

If the user selects **Other**, inform them:
"Clancy currently supports Jira, GitHub Issues, and Linear. You may need manual setup for other boards."

Store the answer as `{board}`.

### GSD follow-ups

Confirm the project type detected in Step 1. Show detected signals as evidence:

```
Is this an existing codebase or a brand-new (greenfield) project?

{If signals detected: We detected: package.json, src/, .git}

1. Existing codebase
2. Greenfield
```

Pre-select the option matching what was detected in Step 1, but let the user override.

Store the answer as `{project_type}`.

### PAUL follow-ups

Confirm the project type detected in Step 1. Show detected signals as evidence:

```
Is this an existing codebase or a brand-new (greenfield) project?

{If signals detected: We detected: package.json, src/, .git}

1. Existing codebase
2. Greenfield
```

Pre-select the option matching what was detected in Step 1, but let the user override.

Store the answer as `{project_type}`.

---

## Step 4: Agent Summary and Confirm

Present the recommended agent summary and ask for confirmation.

### Clancy Summary

```
Recommended agent: Clancy

Clancy is an autonomous, board-driven development agent — named after Chief
Clancy Wiggum (Ralph's dad, The Simpsons). It's built on the Ralph technique
coined by Geoffrey Huntley: a loop that gives Claude Code a fresh context
window for every task.

Once installed, Clancy will:
  ✓ Connect to your {board} board
  ✓ Pick up tickets assigned to you
  ✓ Implement each one with full codebase context
  ✓ Commit, merge, and transition tickets on the board
  ✓ Log progress and loop until your queue is empty

Optional roles available:
  • Planner — refine backlog tickets into implementation plans
  • Strategist (coming soon) — turn vague ideas into structured briefs and tickets

Install Clancy? (y/n)
```

### GSD Summary

```
Recommended agent: GSD (Get Shit Done)

GSD is a spec-driven development system by TÂCHES that uses parallel
subagent execution to move fast. Each executor gets a fresh 200k-token
context window — no context rot, no quality degradation.

Once installed, GSD will:
  ✓ {If existing: Scan your codebase / If greenfield: Set up project structure}
  ✓ Build a roadmap broken into phases
  ✓ Execute plans in parallel waves via subagents
  ✓ Verify work with automated checks and UAT

GSD also works with OpenCode, Gemini CLI, and Codex — not just Claude Code.

Install GSD? (y/n)
```

### PAUL Summary

```
Recommended agent: PAUL (Plan-Apply-Unify Loop)

PAUL is a quality-first development framework by Christopher Kahler.
Every piece of work follows a mandatory Plan → Apply → Unify cycle with
BDD acceptance criteria — orphan plans are prohibited, every plan closes.

Once installed, PAUL will:
  ✓ {If existing: Scan your codebase / If greenfield: Set up project structure}
  ✓ Create phased roadmaps with milestones
  ✓ Enforce acceptance criteria (Given/When/Then) before work begins
  ✓ Close every loop with a SUMMARY reconciling planned vs actual

PAUL is ideal when traceability and correctness matter as much as speed.

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
- Detected `{framework}`, `{language}`, `{git_host}`, `{ci_provider}` (for agent context)
