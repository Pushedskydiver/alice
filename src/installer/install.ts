#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { bold, brightRed, dim, green, red } from '~/utils/ansi/ansi.js';

import { choose, closePrompts } from './prompts.js';

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

const getVersion = (): string => {
  const pkgPath = resolve(__dirname, '..', '..', 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
      version: string;
    };
    return pkg.version;
  } catch {
    return '0.0.0';
  }
};

const getSourceRoot = (): string => resolve(__dirname, '..', '..');

const copyDir = (src: string, dest: string): void => {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
};

type InstallLocation = 'global' | 'local';

const getTargetDir = (location: InstallLocation): string => {
  if (location === 'global') {
    const home = process.env.HOME ?? process.env.USERPROFILE ?? '';
    return join(home, '.claude');
  }
  return join(process.cwd(), '.claude');
};

const registerHooks = (location: InstallLocation): void => {
  const settingsPath =
    location === 'global'
      ? join(
          process.env.HOME ?? process.env.USERPROFILE ?? '',
          '.claude',
          'settings.json',
        )
      : join(process.cwd(), '.claude', 'settings.json');

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
        command: `node ${checkUpdatePath}`,
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
        command: `node ${contextMonitorPath}`,
        type: 'command',
      });
    }
  }
};

const install = async (): Promise<void> => {
  const version = getVersion();

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

install().catch((err: unknown) => {
  console.error(red(`❌ Failed to install: ${String(err)}`));
  closePrompts();
  process.exit(1);
});
