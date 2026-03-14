import * as readline from 'node:readline';

let rl: readline.Interface | null = null;

const getInterface = (): readline.Interface => {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
};

export const ask = (question: string): Promise<string> =>
  new Promise((resolve) => {
    getInterface().question(question, (answer) => {
      resolve(answer.trim());
    });
  });

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
  if (isNaN(parsed) || parsed < 1 || parsed > options.length) {
    return defaultIndex;
  }

  return parsed - 1;
};

export const closePrompts = (): void => {
  if (rl) {
    rl.close();
    rl = null;
  }
};
