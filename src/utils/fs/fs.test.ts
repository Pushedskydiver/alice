import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { copyDir } from './fs.js';

const makeTmpDir = (): string => {
  const dir = join(tmpdir(), `alice-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

describe('copyDir', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = makeTmpDir();
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('copies files from src to dest', () => {
    const src = join(tmp, 'src');
    const dest = join(tmp, 'dest');
    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, 'hello.txt'), 'world');

    copyDir(src, dest);

    expect(readFileSync(join(dest, 'hello.txt'), 'utf-8')).toBe('world');
  });

  it('copies nested directories recursively', () => {
    const src = join(tmp, 'src');
    const nested = join(src, 'a', 'b');
    const dest = join(tmp, 'dest');
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(nested, 'deep.txt'), 'content');

    copyDir(src, dest);

    expect(readFileSync(join(dest, 'a', 'b', 'deep.txt'), 'utf-8')).toBe(
      'content',
    );
  });

  it('no-ops when source does not exist', () => {
    const dest = join(tmp, 'dest');

    copyDir(join(tmp, 'nonexistent'), dest);

    expect(existsSync(dest)).toBe(false);
  });
});
