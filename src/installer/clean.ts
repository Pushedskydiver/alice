import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { InstallLocation } from '~/types/install.js';
import { green } from '~/utils/ansi/ansi.js';
import { removeIgnoreEntries } from '~/utils/ignore/ignore.js';

import { getTargetDir } from './paths.js';

/**
 * Removes a previous Alice installation so a fresh install can proceed.
 *
 * Cleans up command and workflow directories, removes Alice hook entries
 * from `settings.json`, and (for local installs) removes ignore-file
 * entries that Alice previously added.
 *
 * @param location - `'global'` or `'local'`, determines which `.claude/` directory to clean.
 */
export const cleanExistingInstall = (location: InstallLocation): void => {
  const targetDir = getTargetDir(location);

  const commandsDir = join(targetDir, 'commands', 'alice');
  if (existsSync(commandsDir)) {
    rmSync(commandsDir, { recursive: true, force: true });
  }

  const workflowsDir = join(targetDir, 'alice');
  if (existsSync(workflowsDir)) {
    rmSync(workflowsDir, { recursive: true, force: true });
  }

  const settingsPath = join(targetDir, 'settings.json');
  if (existsSync(settingsPath)) {
    try {
      type Settings = {
        hooks?: Record<string, { command: string; type?: string }[]>;
        [key: string]: unknown;
      };

      const settings = JSON.parse(
        readFileSync(settingsPath, 'utf-8'),
      ) as Settings;

      if (settings.hooks) {
        for (const [event, hooks] of Object.entries(settings.hooks)) {
          settings.hooks[event] = hooks.filter(
            (h) =>
              !h.command.includes('alice-check-update') &&
              !h.command.includes('alice-context-monitor'),
          );
        }
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
      }
    } catch {
      // If settings.json is corrupted, leave it alone
    }
  }

  if (location === 'local') {
    removeIgnoreEntries(process.cwd());
  }

  console.log(`  ${green('✓')} Removed previous Alice installation`);
};
