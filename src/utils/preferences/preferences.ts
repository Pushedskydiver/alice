import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import type { InstallLocation } from '~/types/install.js';
import { parseJson } from '~/utils/parse-json/parse-json.js';

type Preferences = {
  install_location?: InstallLocation;
};

const VALID_LOCATIONS: readonly string[] = ['global', 'local'];

/**
 * Returns the path to the Alice preferences file.
 * Uses `~/.config/alice-agents/config.json` on all platforms.
 *
 * @returns Absolute path to the config file.
 */
export const getPreferencesPath = (): string => {
  const home = homedir();
  return join(home, '.config', 'alice-agents', 'config.json');
};

/**
 * Loads saved preferences from disk. Returns an empty object if the
 * file does not exist, cannot be read, or cannot be parsed.
 *
 * @param path - Optional override path for testing.
 * @returns The preferences object (may be empty).
 */
export const loadPreferences = (path?: string): Preferences => {
  const filePath = path ?? getPreferencesPath();

  try {
    if (!existsSync(filePath)) return {};

    const raw = readFileSync(filePath, 'utf-8');
    const parsed = parseJson<Preferences>(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
};

/**
 * Saves preferences to disk. Creates the directory if it does not exist.
 *
 * @param prefs - The preferences to save.
 * @param path - Optional override path for testing.
 */
export const savePreferences = (prefs: Preferences, path?: string): void => {
  const filePath = path ?? getPreferencesPath();
  const dir = dirname(filePath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filePath, JSON.stringify(prefs, null, 2) + '\n');
};

/**
 * Returns the saved install location preference, or `undefined` if the
 * value is missing or not a valid location (`'global'` or `'local'`).
 *
 * @param path - Optional override path for testing.
 * @returns The saved install location or `undefined`.
 */
export const getSavedLocation = (
  path?: string,
): InstallLocation | undefined => {
  const prefs = loadPreferences(path);
  const value = prefs.install_location;

  if (value && VALID_LOCATIONS.includes(value)) {
    return value;
  }

  return undefined;
};
