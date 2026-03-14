import * as readline from 'node:readline';

let rl: readline.Interface | null = null;

/**
 * Returns the shared readline interface, creating one if it doesn't exist.
 *
 * @returns The singleton `readline.Interface` bound to stdin/stdout.
 */
const getInterface = (): readline.Interface => {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
};

/**
 * Prompts the user with a question and waits for a single-line answer.
 *
 * @param question - The prompt text displayed to the user.
 * @returns The trimmed answer string.
 *
 * @example
 * ```ts
 * const name = await ask('What is your name? ');
 * ```
 */
export const ask = (question: string): Promise<string> =>
  new Promise((resolve) => {
    getInterface().question(question, (answer) => {
      resolve(answer.trim());
    });
  });

/**
 * Presents a numbered list of options and returns the selected index.
 *
 * Falls back to `defaultIndex` when the user presses Enter without typing,
 * or enters an invalid value.
 *
 * @param question - The prompt text displayed above the options.
 * @param options - The list of option labels to display.
 * @param defaultIndex - The zero-based index selected when input is empty. Defaults to `0`.
 * @returns The zero-based index of the chosen option.
 *
 * @example
 * ```ts
 * const choice = await choose('Pick a colour:', ['Red', 'Blue', 'Green']);
 * // Displays:
 * //   Pick a colour?
 * //     [1] Red
 * //     [2] Blue
 * //     [3] Green
 * //   Choice [1]:
 * ```
 */
export const choose = async (
  question: string,
  options: string[],
  defaultIndex = 0,
): Promise<number> => {
  const lines = options.map((opt, i) => `    [${i + 1}] ${opt}`).join('\n');
  const prompt = `${question}\n${lines}\n  Choice [${defaultIndex + 1}]: `;
  const answer = await ask(prompt);

  if (answer === '') return defaultIndex;

  const parsed = parseInt(answer, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > options.length) {
    return defaultIndex;
  }

  return parsed - 1;
};

/**
 * Closes the shared readline interface and releases stdin.
 *
 * Safe to call multiple times — no-ops if the interface is already closed.
 */
export const closePrompts = (): void => {
  if (rl) {
    rl.close();
    rl = null;
  }
};
