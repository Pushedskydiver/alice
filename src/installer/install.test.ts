import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('installer utilities', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `alice-test-${randomUUID()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('creates target directory when copying', () => {
    const dest = join(testDir, 'nested', 'dir');
    mkdirSync(dest, { recursive: true });
    expect(existsSync(dest)).toBe(true);
  });

  it('reads package.json version', () => {
    const pkgPath = join(testDir, 'package.json');
    const pkg = JSON.stringify({ version: '1.2.3' });
    writeFileSync(pkgPath, pkg);
    const content = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
      version: string;
    };
    expect(content.version).toBe('1.2.3');
  });
});
