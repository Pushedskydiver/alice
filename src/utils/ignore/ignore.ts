import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ALICE_COMMENT = '# Added by Alice';
const CLAUDE_ENTRY = '.claude/';

const IGNORE_FILES = [
  '.gitignore',
  '.prettierignore',
  '.eslintignore',
] as const;

/**
 * Checks whether a file already contains a specific entry.
 *
 * @param filePath - Absolute path to the file.
 * @param entry - The line to search for.
 * @returns `true` if the entry is present.
 */
const hasEntry = (filePath: string, entry: string): boolean => {
  const content = readFileSync(filePath, 'utf-8');
  return content.split('\n').some((line) => line.trim() === entry);
};

/**
 * Checks whether a file contains an Alice-tagged entry, defined as the
 * identifying comment immediately followed by the ignore pattern.
 *
 * @param filePath - Absolute path to the file.
 * @param comment - The identifying comment line (e.g. `# Added by Alice`).
 * @param entry - The pattern line to search for (e.g. `.claude/`).
 * @returns `true` if the tagged pair is present.
 */
const hasTaggedEntry = (
  filePath: string,
  comment: string,
  entry: string,
): boolean => {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (lines[i].trim() === comment && lines[i + 1].trim() === entry) {
      return true;
    }
  }
  return false;
};

/**
 * Appends an ignore entry to a file with an identifying comment.
 *
 * @param filePath - Absolute path to the ignore file.
 * @param entry - The pattern to add (e.g. `.claude/`).
 */
const appendEntry = (filePath: string, entry: string): void => {
  const content = readFileSync(filePath, 'utf-8');
  if (content.length === 0) {
    writeFileSync(filePath, `${ALICE_COMMENT}\n${entry}\n`);
    return;
  }
  const separator = content.endsWith('\n') ? '\n' : '\n\n';
  writeFileSync(filePath, `${content}${separator}${ALICE_COMMENT}\n${entry}\n`);
};

/**
 * Removes an ignore entry and its identifying comment from a file.
 *
 * @param filePath - Absolute path to the ignore file.
 * @param entry - The pattern to remove (e.g. `.claude/`).
 */
const removeEntry = (filePath: string, entry: string): void => {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const filtered: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === ALICE_COMMENT && lines[i + 1]?.trim() === entry) {
      // Skip the comment, the entry, and any trailing blank line
      i += 1;
      if (lines[i + 1]?.trim() === '') {
        i += 1;
      }
      continue;
    }
    filtered.push(lines[i]);
  }

  let result = filtered.join('\n');
  if (result.length > 0 && !result.endsWith('\n')) {
    result += '\n';
  }
  writeFileSync(filePath, result);
};

/**
 * Adds `.claude/` to ignore files in the given directory.
 *
 * - `.gitignore` is created if it doesn't exist.
 * - Other ignore files (`.prettierignore`, `.eslintignore`) are only
 *   updated if they already exist — never created.
 * - Skips files that already contain the entry.
 *
 * @param projectDir - The root directory of the user's project.
 * @returns The list of files that were modified or created.
 */
export const addIgnoreEntries = (projectDir: string): string[] => {
  const modified: string[] = [];

  for (const file of IGNORE_FILES) {
    const filePath = join(projectDir, file);
    const exists = existsSync(filePath);

    if (file === '.gitignore' && !exists) {
      writeFileSync(filePath, `${ALICE_COMMENT}\n${CLAUDE_ENTRY}\n`);
      modified.push(file);
      continue;
    }

    if (!exists) continue;

    if (!hasEntry(filePath, CLAUDE_ENTRY)) {
      appendEntry(filePath, CLAUDE_ENTRY);
      modified.push(file);
    }
  }

  return modified;
};

/**
 * Removes `.claude/` entries that Alice added from ignore files in the
 * given directory. Only touches files that exist and contain the
 * Alice-tagged entry (comment + pattern pair).
 *
 * @param projectDir - The root directory of the user's project.
 * @returns The list of files that were modified.
 */
export const removeIgnoreEntries = (projectDir: string): string[] => {
  const modified: string[] = [];

  for (const file of IGNORE_FILES) {
    const filePath = join(projectDir, file);

    if (!existsSync(filePath)) continue;

    if (hasTaggedEntry(filePath, ALICE_COMMENT, CLAUDE_ENTRY)) {
      removeEntry(filePath, CLAUDE_ENTRY);
      modified.push(file);
    }
  }

  return modified;
};
