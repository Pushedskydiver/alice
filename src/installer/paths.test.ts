import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { getHomeDir, getTargetDir } from './paths.js';

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
