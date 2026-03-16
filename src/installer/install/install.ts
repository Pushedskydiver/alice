#!/usr/bin/env node

import { join, resolve } from 'node:path';

import { choose, closePrompts } from '~/prompts/prompts.js';
import type { InstallLocation } from '~/types/install.js';
import { bold, brightRed, dim, green, red } from '~/utils/ansi/ansi.js';
import { copyDir } from '~/utils/fs/fs.js';
import { addIgnoreEntries } from '~/utils/ignore/ignore.js';
import {
  getSavedLocation,
  savePreferences,
} from '~/utils/preferences/preferences.js';
import { getVersion } from '~/utils/version/version.js';

import { cleanExistingInstall } from '../clean/clean.js';
import { printErrorHint } from '../errors/errors.js';
import { registerHooks } from '../hooks/hooks.js';
import { getSourceRoot, getTargetDir } from '../paths/paths.js';
import { BANNER, showDryRun, showHelp } from '../ui/ui.js';

/**
 * Main installer entry point. Displays the ASCII banner, prompts for
 * install location (or reads `--global`/`--local` flags), copies commands
 * and workflows into the target `.claude/` directory, and registers hooks.
 *
 * Supports `--help`, `--version`, `--dry-run`, `--reinstall`, and graceful
 * Ctrl+C handling. Requires `--global` or `--local` in non-interactive (CI)
 * environments.
 */
export const install = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const version = getVersion(getSourceRoot());

  // Early-exit flags (before banner)
  if (args.includes('--help')) {
    return showHelp(version);
  }

  if (args.includes('--version')) {
    console.log(version);
    return process.exit(0) as never;
  }

  if (args.includes('--reset-preferences')) {
    savePreferences({});
    console.log('✓ Preferences cleared.');
    return process.exit(0) as never;
  }

  // Graceful Ctrl+C handling
  const handleSigint = (): void => {
    closePrompts();
    console.log();
    process.exit(0);
  };
  process.on('SIGINT', handleSigint);

  try {
    console.log(BANNER);
    console.log(
      `  ${bold(`v${version}`)}${dim('  Find the right AI coding agent for your project.')}`,
    );
    console.log(dim('  "My name is Alice, and I remember everything."'));
    console.log();

    let location: InstallLocation;

    if (args.includes('--global') && args.includes('--local')) {
      console.error(red('Cannot use both --global and --local. Pick one.'));
      return process.exit(1) as never;
    } else if (args.includes('--global')) {
      location = 'global';
    } else if (args.includes('--local')) {
      location = 'local';
    } else if (!process.stdin.isTTY) {
      console.error(
        red('Non-interactive environment detected. Use --global or --local.'),
      );
      console.error(dim('  Example: npx alice-agents --global'));
      closePrompts();
      return process.exit(1) as never;
    } else {
      const saved = getSavedLocation();

      if (saved) {
        console.log(
          `  Installing ${saved}ly ${dim(`(saved preference. Use --global or --local to override.)`)}`,
        );
        location = saved;
      } else {
        const choice = await choose('  Where would you like to install?', [
          `Global ${dim('(~/.claude)   — available in all projects')}`,
          `Local  ${dim('(./.claude)  — this project only')}`,
        ]);
        location = choice === 0 ? 'global' : 'local';
        savePreferences({ install_location: location });
      }
    }

    // Dry-run mode — show what would happen, then exit
    if (args.includes('--dry-run')) {
      showDryRun(location);
      return;
    }

    if (args.includes('--reinstall')) {
      cleanExistingInstall(location);
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

    if (location === 'local') {
      const ignored = addIgnoreEntries(process.cwd());
      if (ignored.length > 0) {
        console.log(`  ${green('✓')} Updated ${ignored.join(', ')}`);
      }
    }

    console.log();
    console.log(`  ${green('✓ Alice installed.')}`);
    console.log(
      `    Run ${brightRed('/alice:init')} in Claude Code to get started.`,
    );
    console.log(
      `    Run ${brightRed('/alice:help')} for a full command reference.`,
    );
    console.log(dim('    "The game has just begun."'));
  } finally {
    closePrompts();
    process.removeListener('SIGINT', handleSigint);
  }
};

const isDirectRun =
  process.argv[1] && resolve(process.argv[1]).includes('install');

if (isDirectRun) {
  install().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(red(`❌ Failed to install: ${message}`));
    printErrorHint(message);
    closePrompts();
    process.exit(1);
  });
}
