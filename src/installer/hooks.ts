import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { InstallLocation } from '~/types/install.js';

import { getSourceRoot, getTargetDir } from './paths.js';

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
