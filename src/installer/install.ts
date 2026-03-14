#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { choose, closePrompts } from '~/prompts/prompts.js';
import type { InstallLocation } from '~/types/install.js';
import { bold, brightRed, dim, green, red } from '~/utils/ansi/ansi.js';
import { copyDir } from '~/utils/fs/fs.js';
import { getVersion } from '~/utils/version/version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BANNER = `
${red('   █████╗ ██╗     ██╗ ██████╗███████╗')}
${red('  ██╔══██╗██║     ██║██╔════╝██╔════╝')}
${red('  ███████║██║     ██║██║     █████╗  ')}
${red('  ██╔══██║██║     ██║██║     ██╔══╝  ')}
${red('  ██║  ██║███████╗██║╚██████╗███████╗')}
${red('  ╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝╚══════╝')}
`;

/**
 * Returns the absolute path to the package root directory.
 *
 * @returns The resolved path two levels above `__dirname`.
 */
export const getSourceRoot = (): string => resolve(__dirname, '..', '..');

/**
 * Returns the user's home directory from environment variables.
 *
 * @returns The home directory path.
 * @throws If neither `HOME` nor `USERPROFILE` is set.
 */
export const getHomeDir = (): string => {
  const home = process.env.HOME ?? process.env.USERPROFILE;
  if (!home) {
    throw new Error(
      'Cannot determine home directory — neither HOME nor USERPROFILE is set.',
    );
  }
  return home;
};

/**
 * Resolves the target `.claude/` directory based on install location.
 *
 * @param location - `'global'` for `~/.claude/`, `'local'` for `./.claude/`.
 * @returns The absolute path to the target directory.
 */
export const getTargetDir = (location: InstallLocation): string => {
  if (location === 'global') {
    return join(getHomeDir(), '.claude');
  }
  return join(process.cwd(), '.claude');
};

/**
 * Registers Alice's hook scripts (update checker, context monitor) in
 * Claude Code's `settings.json`. Skips hooks that are already registered
 * to avoid duplicates.
 *
 * @param location - `'global'` or `'local'`, determines which `settings.json` to update.
 */
export const registerHooks = (location: InstallLocation): void => {
  const targetDir = getTargetDir(location);
  const settingsPath = join(targetDir, 'settings.json');

  const sourceRoot = getSourceRoot();
  const hooksDir = join(sourceRoot, 'hooks');

  if (!existsSync(hooksDir)) return;

  type Settings = {
    hooks?: Record<string, { command: string; type?: string }[]>;
    [key: string]: unknown;
  };

  let settings: Settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as Settings;
    } catch {
      settings = {};
    }
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }

  const checkUpdatePath = join(hooksDir, 'alice-check-update.js');
  const contextMonitorPath = join(hooksDir, 'alice-context-monitor.js');

  if (existsSync(checkUpdatePath)) {
    if (!settings.hooks.SessionStart) {
      settings.hooks.SessionStart = [];
    }
    const already = settings.hooks.SessionStart.some((h) =>
      h.command.includes('alice-check-update'),
    );
    if (!already) {
      settings.hooks.SessionStart.push({
        command: `node "${checkUpdatePath}"`,
        type: 'command',
      });
    }
  }

  if (existsSync(contextMonitorPath)) {
    if (!settings.hooks.Notification) {
      settings.hooks.Notification = [];
    }
    const already = settings.hooks.Notification.some((h) =>
      h.command.includes('alice-context-monitor'),
    );
    if (!already) {
      settings.hooks.Notification.push({
        command: `node "${contextMonitorPath}"`,
        type: 'command',
      });
    }
  }

  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
};

/**
 * Main installer entry point. Displays the ASCII banner, prompts for
 * install location (or reads `--global`/`--local` flags), copies commands
 * and workflows into the target `.claude/` directory, and registers hooks.
 */
export const install = async (): Promise<void> => {
  const version = getVersion(getSourceRoot());

  console.log(BANNER);
  console.log(
    `  ${bold(`v${version}`)}${dim('  Find the right AI coding agent for your project.')}`,
  );
  console.log(dim('  "My name is Alice, and I remember everything."'));
  console.log();

  const args = process.argv.slice(2);
  let location: InstallLocation;

  if (args.includes('--global')) {
    location = 'global';
  } else if (args.includes('--local')) {
    location = 'local';
  } else {
    const choice = await choose('  Where would you like to install?', [
      `Global ${dim('(~/.claude)   — available in all projects')}`,
      `Local  ${dim('(./.claude)  — this project only')}`,
    ]);
    location = choice === 0 ? 'global' : 'local';
  }

  const targetDir = getTargetDir(location);
  const sourceRoot = getSourceRoot();

  const commandsSrc = join(sourceRoot, 'src', 'commands');
  const commandsDest = join(targetDir, 'commands', 'alice');

  const workflowsSrc = join(sourceRoot, 'src', 'workflows');
  const workflowsDest = join(targetDir, 'alice', 'workflows');

  copyDir(commandsSrc, commandsDest);
  console.log(`  ${green('✓')} Installed commands/alice`);

  copyDir(workflowsSrc, workflowsDest);

  registerHooks(location);
  console.log(`  ${green('✓')} Registered hooks`);

  console.log();
  console.log(`  ${green('✓ Alice installed.')}`);
  console.log(
    `    Run ${brightRed('/alice:init')} in Claude Code to get started.`,
  );
  console.log(
    `    Run ${brightRed('/alice:help')} for a full command reference.`,
  );
  console.log(dim('    "The game has just begun."'));

  closePrompts();
};

const isDirectRun =
  process.argv[1] && resolve(process.argv[1]).includes('install');

if (isDirectRun) {
  install().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(red(`❌ Failed to install: ${message}`));
    closePrompts();
    process.exit(1);
  });
}
