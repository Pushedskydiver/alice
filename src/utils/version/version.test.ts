import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getVersion } from './version.js';

const makeTmpDir = (): string => {
  const dir = join(tmpdir(), `alice-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

describe('getVersion', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = makeTmpDir();
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('reads version from package.json', () => {
    writeFileSync(
      join(tmp, 'package.json'),
      JSON.stringify({ version: '1.2.3' }),
    );

    expect(getVersion(tmp)).toBe('1.2.3');
  });

  it('returns 0.0.0 when package.json does not exist', () => {
    expect(getVersion(tmp)).toBe('0.0.0');
  });

  it('returns 0.0.0 when package.json is invalid JSON', () => {
    writeFileSync(join(tmp, 'package.json'), 'not json');

    expect(getVersion(tmp)).toBe('0.0.0');
  });
});
