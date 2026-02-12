import { describe, it, expect } from 'vitest';
import { formatDateLabel } from '../../src/utils/dateFormat';

describe('formatDateLabel', () => {
  it('formats birth and death years', () => {
    expect(formatDateLabel(1940, 2020)).toBe('1940 — 2020');
  });

  it('formats birth year only', () => {
    expect(formatDateLabel(1940)).toBe('1940');
  });

  it('formats death year only', () => {
    expect(formatDateLabel(undefined, 2020)).toBe('† 2020');
  });

  it('returns empty string when no dates', () => {
    expect(formatDateLabel()).toBe('');
  });
});
