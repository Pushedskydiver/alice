import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Reads the package version from a `package.json` relative to a base directory.
 *
 * @param baseDir - The directory to resolve `package.json` from.
 * @returns The version string, or `'0.0.0'` if the file cannot be read.
 *
 * @example
 * ```ts
 * const version = getVersion('/path/to/project');
 * // '0.1.0'
 * ```
 */
export const getVersion = (baseDir: string): string => {
  const pkgPath = resolve(baseDir, 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
      version?: string;
    };
    return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
};
