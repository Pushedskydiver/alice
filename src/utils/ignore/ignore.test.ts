import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { addIgnoreEntries, removeIgnoreEntries } from './ignore.js';

const makeTmpDir = (): string => {
  const dir = join(tmpdir(), `alice-test-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

describe('addIgnoreEntries', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = makeTmpDir();
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('creates .gitignore if it does not exist', () => {
    const modified = addIgnoreEntries(tmp);

    expect(modified).toEqual(['.gitignore']);
    const content = readFileSync(join(tmp, '.gitignore'), 'utf-8');
    expect(content).toContain('.claude/');
    expect(content).toContain('# Added by Alice');
  });

  it('appends to existing .gitignore', () => {
    writeFileSync(join(tmp, '.gitignore'), 'node_modules/\n');

    const modified = addIgnoreEntries(tmp);

    expect(modified).toEqual(['.gitignore']);
    const content = readFileSync(join(tmp, '.gitignore'), 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('.claude/');
  });

  it('skips .gitignore if .claude/ is already present', () => {
    writeFileSync(join(tmp, '.gitignore'), 'node_modules/\n.claude/\n');

    const modified = addIgnoreEntries(tmp);

    expect(modified).toEqual([]);
  });

  it('updates .prettierignore if it exists', () => {
    writeFileSync(join(tmp, '.prettierignore'), 'dist/\n');

    const modified = addIgnoreEntries(tmp);

    expect(modified).toContain('.prettierignore');
    const content = readFileSync(join(tmp, '.prettierignore'), 'utf-8');
    expect(content).toContain('.claude/');
  });

  it('updates .eslintignore if it exists', () => {
    writeFileSync(join(tmp, '.eslintignore'), 'dist/\n');

    const modified = addIgnoreEntries(tmp);

    expect(modified).toContain('.eslintignore');
    const content = readFileSync(join(tmp, '.eslintignore'), 'utf-8');
    expect(content).toContain('.claude/');
  });

  it('does not create .prettierignore or .eslintignore', () => {
    addIgnoreEntries(tmp);

    expect(existsSync(join(tmp, '.prettierignore'))).toBe(false);
    expect(existsSync(join(tmp, '.eslintignore'))).toBe(false);
  });

  it('handles multiple ignore files at once', () => {
    writeFileSync(join(tmp, '.prettierignore'), 'dist/\n');
    writeFileSync(join(tmp, '.eslintignore'), 'dist/\n');

    const modified = addIgnoreEntries(tmp);

    expect(modified).toContain('.gitignore');
    expect(modified).toContain('.prettierignore');
    expect(modified).toContain('.eslintignore');
  });
});

describe('removeIgnoreEntries', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = makeTmpDir();
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('removes .claude/ and comment from .gitignore', () => {
    writeFileSync(
      join(tmp, '.gitignore'),
      'node_modules/\n\n# Added by Alice\n.claude/\n',
    );

    const modified = removeIgnoreEntries(tmp);

    expect(modified).toEqual(['.gitignore']);
    const content = readFileSync(join(tmp, '.gitignore'), 'utf-8');
    expect(content).not.toContain('.claude/');
    expect(content).not.toContain('# Added by Alice');
    expect(content).toContain('node_modules/');
  });

  it('removes entries from multiple ignore files', () => {
    writeFileSync(join(tmp, '.gitignore'), '# Added by Alice\n.claude/\n');
    writeFileSync(
      join(tmp, '.prettierignore'),
      'dist/\n\n# Added by Alice\n.claude/\n',
    );

    const modified = removeIgnoreEntries(tmp);

    expect(modified).toContain('.gitignore');
    expect(modified).toContain('.prettierignore');
  });

  it('skips files that do not contain .claude/', () => {
    writeFileSync(join(tmp, '.gitignore'), 'node_modules/\n');

    const modified = removeIgnoreEntries(tmp);

    expect(modified).toEqual([]);
  });

  it('does not remove .claude/ if not tagged by Alice', () => {
    writeFileSync(join(tmp, '.gitignore'), 'node_modules/\n.claude/\n');

    const modified = removeIgnoreEntries(tmp);

    expect(modified).toEqual([]);
    const content = readFileSync(join(tmp, '.gitignore'), 'utf-8');
    expect(content).toContain('.claude/');
  });

  it('skips files that do not exist', () => {
    const modified = removeIgnoreEntries(tmp);

    expect(modified).toEqual([]);
  });

  it('roundtrips with addIgnoreEntries', () => {
    writeFileSync(join(tmp, '.gitignore'), 'node_modules/\ndist/\n');

    addIgnoreEntries(tmp);
    removeIgnoreEntries(tmp);

    const content = readFileSync(join(tmp, '.gitignore'), 'utf-8');
    expect(content).not.toContain('.claude/');
    expect(content).toContain('node_modules/');
    expect(content).toContain('dist/');
  });
});
