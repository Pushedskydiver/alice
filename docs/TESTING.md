# Testing

## Framework

Alice uses [Vitest](https://vitest.dev/) with globals enabled, so `describe`, `it`, `expect`, `vi`, `beforeEach`, and `afterEach` are available without imports.

## Co-located tests

Test files live next to their source files with the naming convention `*.test.ts`:

```
src/installer/paths/paths.ts
src/installer/paths/paths.test.ts
src/utils/ansi/ansi.ts
src/utils/ansi/ansi.test.ts
```

## Coverage

- **Provider:** v8
- **Thresholds:** 80% for branches, functions, lines, and statements
- Coverage reports are generated with `npm run test:coverage`

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all tests once |
| `npm run dev` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Filesystem tests

When tests need to write to disk:

1. Create a temporary directory using `os.tmpdir()` and `crypto.randomUUID()` for isolation.
2. Perform file operations within that temporary directory.
3. Clean up in `afterEach` by removing the temporary directory.

This avoids polluting the project directory and prevents test interference.

## Mocking

- Use `vi.mock()` for module-level mocks (e.g. mocking `node:fs` or `node:readline`).
- Use `vi.spyOn()` for targeted spying on specific methods.
- Common mocking targets:
  - `readline` — mock user input in prompt tests
  - `fs` — mock filesystem reads/writes in installer tests
  - `process.stdout` — capture printed output
