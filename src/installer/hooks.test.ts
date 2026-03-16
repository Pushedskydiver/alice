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

import { registerHooks } from './hooks.js';

const makeTmpDir = (): string => {
  const dir = join(tmpdir(), `alice-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

describe('registerHooks', () => {
  let tmp: string;
  const originalHome = process.env.HOME;
  const originalCwd = process.cwd;

  beforeEach(() => {
    tmp = makeTmpDir();
    vi.spyOn(process, 'cwd').mockReturnValue(tmp);
  });

  afterEach(() => {
    process.env.HOME = originalHome;
    process.cwd = originalCwd;
    rmSync(tmp, { recursive: true, force: true });
  });

  it('writes settings.json with hook entries', () => {
    registerHooks('local');

    const settingsPath = join(tmp, '.claude', 'settings.json');
    expect(existsSync(settingsPath)).toBe(true);

    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as {
      hooks: Record<string, { command: string; type: string }[]>;
    };

    expect(settings.hooks.SessionStart).toBeDefined();
    expect(settings.hooks.Notification).toBeDefined();
    expect(settings.hooks.SessionStart.length).toBe(1);
    expect(settings.hooks.Notification.length).toBe(1);
    expect(settings.hooks.SessionStart[0].command).toContain(
      'alice-check-update',
    );
    expect(settings.hooks.Notification[0].command).toContain(
      'alice-context-monitor',
    );
  });

  it('quotes hook paths in commands', () => {
    registerHooks('local');

    const settingsPath = join(tmp, '.claude', 'settings.json');
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as {
      hooks: Record<string, { command: string }[]>;
    };

    expect(settings.hooks.SessionStart[0].command).toMatch(/^node ".*"$/);
    expect(settings.hooks.Notification[0].command).toMatch(/^node ".*"$/);
  });

  it('preserves existing settings when adding hooks', () => {
    const settingsDir = join(tmp, '.claude');
    mkdirSync(settingsDir, { recursive: true });
    writeFileSync(
      join(settingsDir, 'settings.json'),
      JSON.stringify({ customKey: 'preserved' }),
    );

    registerHooks('local');

    const settings = JSON.parse(
      readFileSync(join(settingsDir, 'settings.json'), 'utf-8'),
    ) as { customKey: string };
    expect(settings.customKey).toBe('preserved');
  });

  it('does not duplicate hooks on repeated calls', () => {
    registerHooks('local');
    registerHooks('local');

    const settingsPath = join(tmp, '.claude', 'settings.json');
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as {
      hooks: Record<string, { command: string }[]>;
    };

    expect(settings.hooks.SessionStart.length).toBe(1);
    expect(settings.hooks.Notification.length).toBe(1);
  });

  it('handles corrupted settings.json gracefully', () => {
    const settingsDir = join(tmp, '.claude');
    mkdirSync(settingsDir, { recursive: true });
    writeFileSync(join(settingsDir, 'settings.json'), 'not json');

    registerHooks('local');

    const settings = JSON.parse(
      readFileSync(join(settingsDir, 'settings.json'), 'utf-8'),
    ) as {
      hooks: Record<string, { command: string }[]>;
    };
    expect(settings.hooks.SessionStart).toBeDefined();
  });

  it('uses global path when location is global', () => {
    const globalHome = makeTmpDir();
    process.env.HOME = globalHome;

    registerHooks('global');

    const settingsPath = join(globalHome, '.claude', 'settings.json');
    expect(existsSync(settingsPath)).toBe(true);

    rmSync(globalHome, { recursive: true, force: true });
  });
});
