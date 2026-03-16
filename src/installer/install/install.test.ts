import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { install } from './install.js';

const makeTmpDir = (): string => {
  const dir = join(tmpdir(), `alice-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

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

  it('--reinstall --local cleans then installs', async () => {
    process.argv = ['node', 'install.js', '--local'];

    // First install
    await install();

    const commandsDir = join(tmp, '.claude', 'commands', 'alice');
    expect(existsSync(commandsDir)).toBe(true);

    // Reinstall
    process.argv = ['node', 'install.js', '--reinstall', '--local'];
    await install();

    // Should still exist after reinstall (cleaned then re-created)
    expect(existsSync(commandsDir)).toBe(true);

    // Verify hooks are not duplicated
    const settingsPath = join(tmp, '.claude', 'settings.json');
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as {
      hooks: Record<string, { command: string }[]>;
    };
    expect(settings.hooks.SessionStart).toHaveLength(1);
    expect(settings.hooks.Notification).toHaveLength(1);
  });
});
