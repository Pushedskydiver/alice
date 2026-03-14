# Git Workflow

## Branch strategy

All work happens on branches off `main`:

- `feature/<name>` — new functionality
- `fix/<name>` — bug fixes
- `chore/<name>` — maintenance, refactoring, CI, docs

Never commit directly to `main`. All changes go through pull requests.

## Commit format

Commits follow **gitmoji + conventional commit** style:

```
<emoji> <type>(<scope>): <description>
```

Examples:

```
feat(installer): add agent selection wizard
fix(hooks): handle missing config gracefully
chore(ci): add typecheck step to pipeline
test(prompts): cover edge case for empty input
docs(readme): update installation instructions
```

## Pull request flow

1. Create a branch from `main`.
2. Make changes, commit with the format above.
3. Open a PR against `main`.
4. CI runs typecheck, lint, build, and tests.
5. Squash merge once approved and CI passes.

## Release flow

Releases are automated via the `release.yml` GitHub Action:

1. Bump the version in `package.json` as part of your PR.
2. Squash merge the PR into `main`.
3. The release workflow detects the version change, creates a git tag, and publishes a GitHub Release with auto-generated release notes.
4. Pre-release versions (containing `alpha`, `beta`, or `rc`) are marked as pre-releases on GitHub.
