import { describe, expect, it } from 'vitest';

import { bold, brightRed, cyan, dim, green, red } from './ansi.js';

describe('ansi', () => {
  it('wraps text in red', () => {
    expect(red('hello')).toBe('\x1b[31mhello\x1b[0m');
  });

  it('wraps text in bright red', () => {
    expect(brightRed('hello')).toBe('\x1b[91mhello\x1b[0m');
  });

  it('wraps text in green', () => {
    expect(green('hello')).toBe('\x1b[32mhello\x1b[0m');
  });

  it('wraps text in cyan', () => {
    expect(cyan('hello')).toBe('\x1b[36mhello\x1b[0m');
  });

  it('wraps text in dim', () => {
    expect(dim('hello')).toBe('\x1b[2mhello\x1b[0m');
  });

  it('wraps text in bold', () => {
    expect(bold('hello')).toBe('\x1b[1mhello\x1b[0m');
  });
});
