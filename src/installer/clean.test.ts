import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cleanExistingInstall } from './clean.js';

const makeTmpDir = (): string => {
  const dir = join(tmpdir(), `alice-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

describe('cleanExistingInstall', () => {
  let tmp: string;
  const originalHome = process.env.HOME;
  const originalCwd = process.cwd;

  beforeEach(() => {
    tmp = makeTmpDir();
    vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.HOME = originalHome;
    process.cwd = originalCwd;
    vi.restoreAllMocks();
    rmSync(tmp, { recursive: true, force: true });
  });

  it('removes existing command and workflow directories', () => {
    const claudeDir = join(tmp, '.claude');
    const commandsDir = join(claudeDir, 'commands', 'alice');
    const workflowsDir = join(claudeDir, 'alice', 'workflows');

    mkdirSync(commandsDir, { recursive: true });
    writeFileSync(join(commandsDir, 'init.md'), '# init');

    mkdirSync(workflowsDir, { recursive: true });
    writeFileSync(join(workflowsDir, 'init.md'), '# workflow');

    // Need a settings.json so the hook filter step doesn't skip
    writeFileSync(
      join(claudeDir, 'settings.json'),
      JSON.stringify({ hooks: {} }),
    );

    cleanExistingInstall('local');

    expect(existsSync(commandsDir)).toBe(false);
    expect(existsSync(join(claudeDir, 'alice'))).toBe(false);
  });

  it('filters Alice hook entries from settings.json', () => {
    const claudeDir = join(tmp, '.claude');
    mkdirSync(claudeDir, { recursive: true });

    const settings = {
      hooks: {
        SessionStart: [
          { command: 'node "/path/to/alice-check-update.js"', type: 'command' },
        ],
        Notification: [
          {
            command: 'node "/path/to/alice-context-monitor.js"',
            type: 'command',
          },
        ],
      },
    };
    writeFileSync(
      join(claudeDir, 'settings.json'),
      JSON.stringify(settings, null, 2),
    );

    cleanExistingInstall('local');

    const updated = JSON.parse(
      readFileSync(join(claudeDir, 'settings.json'), 'utf-8'),
    ) as { hooks: Record<string, unknown[]> };
    expect(updated.hooks.SessionStart).toHaveLength(0);
    expect(updated.hooks.Notification).toHaveLength(0);
  });

  it('preserves non-Alice hooks in settings.json', () => {
    const claudeDir = join(tmp, '.claude');
    mkdirSync(claudeDir, { recursive: true });

    const settings = {
      hooks: {
        SessionStart: [
          { command: 'node "/path/to/alice-check-update.js"', type: 'command' },
          { command: 'node "/path/to/my-custom-hook.js"', type: 'command' },
        ],
        Notification: [
          {
            command: 'node "/path/to/alice-context-monitor.js"',
            type: 'command',
          },
          { command: 'echo hello', type: 'command' },
        ],
      },
    };
    writeFileSync(
      join(claudeDir, 'settings.json'),
      JSON.stringify(settings, null, 2),
    );

    cleanExistingInstall('local');

    const updated = JSON.parse(
      readFileSync(join(claudeDir, 'settings.json'), 'utf-8'),
    ) as {
      hooks: Record<string, { command: string }[]>;
    };
    expect(updated.hooks.SessionStart).toHaveLength(1);
    expect(updated.hooks.SessionStart[0].command).toContain('my-custom-hook');
    expect(updated.hooks.Notification).toHaveLength(1);
    expect(updated.hooks.Notification[0].command).toBe('echo hello');
  });

  it('calls removeIgnoreEntries for local installs', () => {
    const claudeDir = join(tmp, '.claude');
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(
      join(claudeDir, 'settings.json'),
      JSON.stringify({ hooks: {} }),
    );

    // Create a .gitignore with Alice entries
    writeFileSync(join(tmp, '.gitignore'), '# Added by Alice\n.claude/\n');

    cleanExistingInstall('local');

    const content = readFileSync(join(tmp, '.gitignore'), 'utf-8');
    expect(content).not.toContain('# Added by Alice');
    expect(content).not.toContain('.claude/');
  });

  it('does not error when directories do not exist', () => {
    const claudeDir = join(tmp, '.claude');
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(
      join(claudeDir, 'settings.json'),
      JSON.stringify({ hooks: {} }),
    );

    expect(() => cleanExistingInstall('local')).not.toThrow();
  });

  it('works with global path', () => {
    const globalHome = makeTmpDir();
    process.env.HOME = globalHome;

    const claudeDir = join(globalHome, '.claude');
    const commandsDir = join(claudeDir, 'commands', 'alice');
    mkdirSync(commandsDir, { recursive: true });
    writeFileSync(join(commandsDir, 'init.md'), '# init');
    writeFileSync(
      join(claudeDir, 'settings.json'),
      JSON.stringify({ hooks: {} }),
    );

    cleanExistingInstall('global');

    expect(existsSync(commandsDir)).toBe(false);

    rmSync(globalHome, { recursive: true, force: true });
  });
});
