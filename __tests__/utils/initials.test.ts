import { describe, it, expect } from 'vitest';
import { getInitials } from '../../src/utils/initials';

describe('getInitials', () => {
  it('extracts two initials from full name', () => {
    expect(getInitials('Ivan Petrov')).toBe('IP');
  });

  it('extracts single initial from one-word name', () => {
    expect(getInitials('Maria')).toBe('M');
  });

  it('handles three-word names (first + last)', () => {
    expect(getInitials('Anna Maria Petrova')).toBe('AP');
  });

  it('returns ? for empty string', () => {
    expect(getInitials('')).toBe('?');
  });

  it('returns ? for whitespace-only string', () => {
    expect(getInitials('   ')).toBe('?');
  });

  it('handles lowercase names', () => {
    expect(getInitials('ivan petrov')).toBe('IP');
  });
});
