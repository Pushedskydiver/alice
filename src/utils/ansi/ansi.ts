/**
 * Wraps text in an ANSI escape sequence.
 *
 * @param code - The ANSI colour/style code (e.g. `'31'` for red).
 * @returns The text wrapped in the escape sequence with a reset suffix.
 */
const esc = (code: string) => `\x1b[${code}m`;

/** Wraps text in red (`\x1b[31m`). */
export const red = (text: string): string => `${esc('31')}${text}${esc('0')}`;

/** Wraps text in bright red (`\x1b[91m`). */
export const brightRed = (text: string): string =>
  `${esc('91')}${text}${esc('0')}`;

/** Wraps text in green (`\x1b[32m`). */
export const green = (text: string): string => `${esc('32')}${text}${esc('0')}`;

/** Wraps text in cyan (`\x1b[36m`). */
export const cyan = (text: string): string => `${esc('36')}${text}${esc('0')}`;

/** Wraps text in dim style (`\x1b[2m`). */
export const dim = (text: string): string => `${esc('2')}${text}${esc('0')}`;

/** Wraps text in bold style (`\x1b[1m`). */
export const bold = (text: string): string => `${esc('1')}${text}${esc('0')}`;
