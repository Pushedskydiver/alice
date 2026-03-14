import type { Interface } from 'node:readline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { choose, closePrompts } from './prompts.js';

const mockQuestion = vi.fn();
const mockClose = vi.fn();

vi.mock('node:readline', () => ({
  createInterface: () =>
    ({
      question: mockQuestion,
      close: mockClose,
    }) as unknown as Interface,
}));

describe('prompts', () => {
  beforeEach(() => {
    closePrompts();
  });

  afterEach(() => {
    closePrompts();
    vi.clearAllMocks();
  });

  describe('choose', () => {
    it('returns default index when input is empty', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb(''),
      );

      const result = await choose('Pick one', ['A', 'B'], 0);
      expect(result).toBe(0);
    });

    it('returns parsed index when valid number given', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb('2'),
      );

      const result = await choose('Pick one', ['A', 'B'], 0);
      expect(result).toBe(1);
    });

    it('returns default for out-of-range input', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb('5'),
      );

      const result = await choose('Pick one', ['A', 'B'], 0);
      expect(result).toBe(0);
    });
  });
});
