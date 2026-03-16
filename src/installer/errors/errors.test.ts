import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { printErrorHint } from './errors.js';

describe('printErrorHint', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('suggests --local for EACCES errors', () => {
    printErrorHint('EACCES: permission denied');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('--local'),
    );
  });

  it('suggests --local for EPERM errors', () => {
    printErrorHint('EPERM: operation not permitted');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('--local'),
    );
  });

  it('handles mixed case permission messages', () => {
    printErrorHint('Permission Denied on /usr/local');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('--local'),
    );
  });

  it('prints nothing for unknown errors', () => {
    printErrorHint('something else went wrong');
    expect(console.error).not.toHaveBeenCalled();
  });
});
