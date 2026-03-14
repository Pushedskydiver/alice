import { describe, expect, it } from 'vitest';

import { parseJson } from './parse-json.js';

describe('parseJson', () => {
  it('parses valid JSON', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('returns null for invalid JSON', () => {
    expect(parseJson('not json')).toBeNull();
  });

  it('parses arrays', () => {
    expect(parseJson('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('returns null for empty string', () => {
    expect(parseJson('')).toBeNull();
  });
});
