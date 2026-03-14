import { cpSync, existsSync, mkdirSync } from 'node:fs';

/**
 * Recursively copies a directory from `src` to `dest`.
 * No-ops if the source directory does not exist.
 *
 * @param src - The source directory path.
 * @param dest - The destination directory path (created recursively if needed).
 */
export const copyDir = (src: string, dest: string): void => {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
};
