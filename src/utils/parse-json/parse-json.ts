/**
 * Safely parses a JSON string, returning `null` on failure instead of throwing.
 *
 * @param raw - The JSON string to parse.
 * @returns The parsed value cast to `T`, or `null` if parsing fails.
 *
 * @example
 * ```ts
 * const data = parseJson<{ version: string }>('{"version":"1.0.0"}');
 * // { version: '1.0.0' }
 *
 * const bad = parseJson('not json');
 * // null
 * ```
 */
export const parseJson = <T>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};
