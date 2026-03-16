import { yellow } from '~/utils/ansi/ansi.js';

/**
 * Prints a contextual hint based on the error message to help the user recover.
 *
 * @param message - The error message string.
 */
export const printErrorHint = (message: string): void => {
  const lower = message.toLowerCase();
  if (
    lower.includes('eacces') ||
    lower.includes('eperm') ||
    lower.includes('permission denied')
  ) {
    console.error(yellow('  Try --local or check directory ownership.'));
  }
};
