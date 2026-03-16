import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getSavedLocation,
  loadPreferences,
  savePreferences,
} from './preferences.js';

let tmp: string;
let configPath: string;

beforeEach(() => {
  tmp = join(tmpdir(), `alice-prefs-test-${crypto.randomUUID()}`);
  mkdirSync(tmp, { recursive: true });
  configPath = join(tmp, 'config.json');
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('loadPreferences', () => {
  it('returns empty object when file does not exist', () => {
    const result = loadPreferences(configPath);
    expect(result).toEqual({});
  });

  it('loads valid preferences from disk', () => {
    writeFileSync(configPath, JSON.stringify({ install_location: 'global' }));

    const result = loadPreferences(configPath);
    expect(result.install_location).toBe('global');
  });

  it('returns empty object for malformed JSON', () => {
    writeFileSync(configPath, '{ broken json }');

    const result = loadPreferences(configPath);
    expect(result).toEqual({});
  });
});

describe('savePreferences', () => {
  it('creates config file and directories', () => {
    const nested = join(tmp, 'nested', 'dir', 'config.json');

    savePreferences({ install_location: 'local' }, nested);

    const content = readFileSync(nested, 'utf-8');
    expect(JSON.parse(content)).toEqual({ install_location: 'local' });
  });

  it('overwrites existing preferences', () => {
    savePreferences({ install_location: 'global' }, configPath);
    savePreferences({ install_location: 'local' }, configPath);

    const content = readFileSync(configPath, 'utf-8');
    expect(JSON.parse(content)).toEqual({ install_location: 'local' });
  });
});

describe('getSavedLocation', () => {
  it('returns undefined when no preferences exist', () => {
    expect(getSavedLocation(configPath)).toBeUndefined();
  });

  it('returns saved install location', () => {
    writeFileSync(configPath, JSON.stringify({ install_location: 'global' }));

    expect(getSavedLocation(configPath)).toBe('global');
  });

  it('returns undefined for invalid install location value', () => {
    writeFileSync(configPath, JSON.stringify({ install_location: 'invalid' }));

    expect(getSavedLocation(configPath)).toBeUndefined();
  });
});
