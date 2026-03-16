import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getHomeDir,
  getTargetDir,
  install,
  printErrorHint,
  registerHooks,
} from './install.js';

const makeTmpDir = (): string => {
  const dir = join(tmpdir(), `alice-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

describe('getHomeDir', () => {
  const originalHome = process.env.HOME;
  const originalUserProfile = process.env.USERPROFILE;

  afterEach(() => {
    process.env.HOME = originalHome;
    process.env.USERPROFILE = originalUserProfile;
  });

  it('returns HOME when set', () => {
    process.env.HOME = '/test/home';
    expect(getHomeDir()).toBe('/test/home');
  });

  it('falls back to USERPROFILE when HOME is not set', () => {
    delete process.env.HOME;
    process.env.USERPROFILE = 'C:\\Users\\test';
    expect(getHomeDir()).toBe('C:\\Users\\test');
  });

  it('throws when neither HOME nor USERPROFILE is set', () => {
    delete process.env.HOME;
    delete process.env.USERPROFILE;
    expect(() => getHomeDir()).toThrow('Cannot determine home directory');
  });
});

describe('getTargetDir', () => {
  const originalHome = process.env.HOME;

  afterEach(() => {
    process.env.HOME = originalHome;
  });

  it('returns ~/.claude for global installs', () => {
    process.env.HOME = '/test/home';
    expect(getTargetDir('global')).toBe(join('/test/home', '.claude'));
  });

  it('returns ./.claude for local installs', () => {
    const result = getTargetDir('local');
    expect(result).toBe(join(process.cwd(), '.claude'));
  });
});

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

describe('install', () => {
  let tmp: string;
  const originalArgv = process.argv;
  const originalHome = process.env.HOME;

  beforeEach(() => {
    tmp = makeTmpDir();
    vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env.HOME = originalHome;
    vi.restoreAllMocks();
    rmSync(tmp, { recursive: true, force: true });
  });

  it('installs locally with --local flag', async () => {
    process.argv = ['node', 'install.js', '--local'];

    await install();

    const commandsDir = join(tmp, '.claude', 'commands', 'alice');
    expect(existsSync(commandsDir)).toBe(true);
  });

  it('installs globally with --global flag', async () => {
    const globalHome = makeTmpDir();
    process.env.HOME = globalHome;
    process.argv = ['node', 'install.js', '--global'];

    await install();

    const commandsDir = join(globalHome, '.claude', 'commands', 'alice');
    expect(existsSync(commandsDir)).toBe(true);

    rmSync(globalHome, { recursive: true, force: true });
  });

  it('copies commands and workflows', async () => {
    process.argv = ['node', 'install.js', '--local'];

    await install();

    const commandsDir = join(tmp, '.claude', 'commands', 'alice');
    const workflowsDir = join(tmp, '.claude', 'alice', 'workflows');
    expect(existsSync(commandsDir)).toBe(true);
    expect(existsSync(workflowsDir)).toBe(true);
  });

  it('registers hooks during install', async () => {
    process.argv = ['node', 'install.js', '--local'];

    await install();

    const settingsPath = join(tmp, '.claude', 'settings.json');
    expect(existsSync(settingsPath)).toBe(true);
  });

  it('creates .gitignore with .claude/ on local install', async () => {
    process.argv = ['node', 'install.js', '--local'];

    await install();

    const gitignorePath = join(tmp, '.gitignore');
    expect(existsSync(gitignorePath)).toBe(true);
    const content = readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('# Added by Alice');
    expect(content).toContain('.claude/');
  });

  it('does not create .gitignore on global install', async () => {
    const globalHome = makeTmpDir();
    process.env.HOME = globalHome;
    process.argv = ['node', 'install.js', '--global'];

    await install();

    const gitignorePath = join(tmp, '.gitignore');
    expect(existsSync(gitignorePath)).toBe(false);

    rmSync(globalHome, { recursive: true, force: true });
  });

  it('--help prints usage and exits 0', async () => {
    process.argv = ['node', 'install.js', '--help'];
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    await install();

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
  });

  it('--version prints version and exits 0', async () => {
    process.argv = ['node', 'install.js', '--version'];
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    await install();

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+\.\d+\.\d+$/),
    );
  });

  it('--dry-run --local shows paths but creates no files', async () => {
    process.argv = ['node', 'install.js', '--dry-run', '--local'];

    await install();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[dry-run]'),
    );
    const commandsDir = join(tmp, '.claude', 'commands', 'alice');
    expect(existsSync(commandsDir)).toBe(false);
  });

  it('--dry-run --global shows global paths', async () => {
    const globalHome = makeTmpDir();
    process.env.HOME = globalHome;
    process.argv = ['node', 'install.js', '--dry-run', '--global'];

    await install();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[dry-run]'),
    );
    const commandsDir = join(globalHome, '.claude', 'commands', 'alice');
    expect(existsSync(commandsDir)).toBe(false);

    rmSync(globalHome, { recursive: true, force: true });
  });

  it('exits 1 in non-TTY without --global or --local', async () => {
    process.argv = ['node', 'install.js'];
    const originalIsTTY = process.stdin.isTTY;
    Object.defineProperty(process.stdin, 'isTTY', {
      value: false,
      configurable: true,
    });
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await install();

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Non-interactive'),
    );

    Object.defineProperty(process.stdin, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
  });

  it('non-TTY with --local succeeds', async () => {
    process.argv = ['node', 'install.js', '--local'];
    const originalIsTTY = process.stdin.isTTY;
    Object.defineProperty(process.stdin, 'isTTY', {
      value: false,
      configurable: true,
    });

    await install();

    const commandsDir = join(tmp, '.claude', 'commands', 'alice');
    expect(existsSync(commandsDir)).toBe(true);

    Object.defineProperty(process.stdin, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
  });

  it('exits 1 when both --global and --local are provided', async () => {
    process.argv = ['node', 'install.js', '--global', '--local'];
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await install();

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Cannot use both'),
    );
  });
});

describe('printErrorHint', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('suggests --local for permission errors', () => {
    printErrorHint('EACCES: permission denied');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('--local'),
    );
  });

  it('prints nothing for unknown errors', () => {
    printErrorHint('something else went wrong');
    expect(console.error).not.toHaveBeenCalled();
  });
});
