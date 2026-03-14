import type { Interface } from 'node:readline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ask, choose, closePrompts } from './prompts.js';

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

  describe('ask', () => {
    it('returns the trimmed answer', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb('  hello  '),
      );

      const result = await ask('Name? ');
      expect(result).toBe('hello');
    });

    it('returns empty string for empty input', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb(''),
      );

      const result = await ask('Name? ');
      expect(result).toBe('');
    });
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

    it('returns default for non-numeric input', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb('abc'),
      );

      const result = await choose('Pick one', ['A', 'B'], 0);
      expect(result).toBe(0);
    });

    it('returns default for zero input', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb('0'),
      );

      const result = await choose('Pick one', ['A', 'B'], 0);
      expect(result).toBe(0);
    });

    it('returns default for negative input', async () => {
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb('-1'),
      );

      const result = await choose('Pick one', ['A', 'B'], 0);
      expect(result).toBe(0);
    });
  });

  describe('closePrompts', () => {
    it('is safe to call multiple times', async () => {
      // Trigger interface creation first
      mockQuestion.mockImplementation(
        (_q: string, cb: (answer: string) => void) => cb(''),
      );
      await ask('test');

      mockClose.mockClear();
      closePrompts();
      closePrompts();
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });
});
