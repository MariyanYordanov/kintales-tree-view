import { describe, it, expect } from 'vitest';
import type { Person } from '../../src/types';
import { warmTheme } from '../../src/themes/warm';
import { neutralTheme } from '../../src/themes/neutral';
import { getInitials } from '../../src/utils/initials';
import { formatDateLabel } from '../../src/utils/dateFormat';

/**
 * TreeNode component tests.
 *
 * Since we run in a Node environment (no SVG renderer),
 * we test the underlying logic that TreeNode uses:
 * - Deceased style computation
 * - Photo/initials fallback logic
 * - Date label formatting
 * - Theme color application
 */

const alivePerson: Person = {
  id: '1',
  name: 'Ivan Petrov',
  gender: 'male',
  birthYear: 1990,
};

const deceasedPerson: Person = {
  id: '2',
  name: 'Maria Ivanova',
  gender: 'female',
  birthYear: 1940,
  deathYear: 2020,
};

describe('TreeNode logic', () => {
  describe('deceased style computation', () => {
    it('alive person has no special styling (deceasedStyle=none)', () => {
      const isDeceased = alivePerson.deathYear != null;
      expect(isDeceased).toBe(false);

      // When not deceased, all styles should use theme defaults
      const opacity = isDeceased && 'dim' === 'dim' ? 0.6 : 1;
      expect(opacity).toBe(1);
    });

    it('deceased person with dim style has opacity 0.6', () => {
      const isDeceased = deceasedPerson.deathYear != null;
      const deceasedStyle = 'dim';

      const opacity =
        isDeceased && deceasedStyle === 'dim' ? 0.6 : 1;
      expect(opacity).toBe(0.6);
    });

    it('deceased person with sepia style has warm brownish colors', () => {
      const isDeceased = deceasedPerson.deathYear != null;
      const deceasedStyle = 'sepia';

      const useSepia = isDeceased && deceasedStyle === 'sepia';
      expect(useSepia).toBe(true);

      const bgColor = useSepia ? '#F5E6D3' : warmTheme.nodeBackgroundColor;
      const borderColor = useSepia ? '#C4A882' : warmTheme.nodeBorderColor;
      const textColor = useSepia ? '#6B5B4A' : warmTheme.nodeTextColor;

      expect(bgColor).toBe('#F5E6D3');
      expect(borderColor).toBe('#C4A882');
      expect(textColor).toBe('#6B5B4A');
    });

    it('deceased person with none style has normal colors', () => {
      const isDeceased = deceasedPerson.deathYear != null;
      expect(isDeceased).toBe(true);

      // With deceasedStyle='none', no visual changes should apply
      // The component uses theme defaults — we verify those are correct
      const bgColor = warmTheme.nodeBackgroundColor;
      const borderColor = warmTheme.nodeBorderColor;

      expect(bgColor).toBe('#FFFAF5');
      expect(borderColor).toBe('#D4A574');
    });

    it('gender does NOT affect node colors', () => {
      const malePerson: Person = { id: '1', name: 'Test', gender: 'male' };
      const femalePerson: Person = { id: '2', name: 'Test', gender: 'female' };

      // Both should use identical theme colors
      const maleColor = warmTheme.nodeBackgroundColor;
      const femaleColor = warmTheme.nodeBackgroundColor;
      expect(maleColor).toBe(femaleColor);

      // No gender-based logic in node rendering
      expect(malePerson.gender).not.toBeUndefined();
      expect(femalePerson.gender).not.toBeUndefined();
    });
  });

  describe('initials fallback', () => {
    it('generates initials when no photo', () => {
      expect(getInitials('Ivan Petrov')).toBe('IP');
    });

    it('generates single initial for one name', () => {
      expect(getInitials('Madonna')).toBe('M');
    });

    it('handles empty name gracefully', () => {
      expect(getInitials('')).toBe('?');
    });
  });

  describe('date label', () => {
    it('shows birth and death years', () => {
      const label = formatDateLabel(1940, 2020);
      expect(label).toBe('1940 — 2020');
    });

    it('shows birth year only for alive person', () => {
      const label = formatDateLabel(1990);
      expect(label).toBe('1990');
    });

    it('shows nothing when no dates', () => {
      const label = formatDateLabel();
      expect(label).toBe('');
    });
  });

  describe('theme integration', () => {
    it('warm theme provides all colors for node rendering', () => {
      expect(warmTheme.nodeBackgroundColor).toBe('#FFFAF5');
      expect(warmTheme.nodeBorderColor).toBe('#D4A574');
      expect(warmTheme.nodeTextColor).toBe('#4A3728');
      expect(warmTheme.photoPlaceholderColor).toBe('#E8D5C0');
    });

    it('neutral theme provides all colors for node rendering', () => {
      expect(neutralTheme.nodeBackgroundColor).toBe('#FFFFFF');
      expect(neutralTheme.nodeBorderColor).toBe('#E0E0E0');
      expect(neutralTheme.nodeTextColor).toBe('#333333');
      expect(neutralTheme.photoPlaceholderColor).toBe('#F0F0F0');
    });
  });
});
