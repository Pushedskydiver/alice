import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { InstallLocation } from '~/types/install.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Returns the absolute path to the package root directory.
 *
 * @returns The resolved path to the package root directory.
 */
export const getSourceRoot = (): string => resolve(__dirname, '..', '..', '..');

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
