import { describe, it, expect } from 'vitest';
import { computeLayout } from '../../src/layout/familyLayout';
import type { Person, Relationship } from '../../src/types';
import { warmTheme } from '../../src/themes/warm';
import { neutralTheme } from '../../src/themes/neutral';
import { resolveTheme } from '../../src/themes';

/**
 * FamilyTree component tests.
 *
 * Since we run in a Node environment (no React Native renderer),
 * we test the component's logic via its underlying pure functions:
 * - computeLayout (layout computation)
 * - resolveTheme (theme resolution)
 * - Default prop values and behavior
 */

const samplePeople: Person[] = [
  { id: '1', name: 'Father', gender: 'male', birthYear: 1960 },
  { id: '2', name: 'Mother', gender: 'female', birthYear: 1962 },
  { id: '3', name: 'Child', gender: 'male', birthYear: 1990 },
];

const sampleRelationships: Relationship[] = [
  { from: '1', to: '2', type: 'spouse' },
  { from: '1', to: '3', type: 'parent' },
  { from: '2', to: '3', type: 'parent' },
];

describe('FamilyTree component logic', () => {
  describe('layout computation', () => {
    it('computes layout with default config', () => {
      const layout = computeLayout(samplePeople, sampleRelationships, '1');

      expect(layout.nodes).toHaveLength(3);
      expect(layout.edges.length).toBeGreaterThan(0);
      expect(layout.width).toBeGreaterThan(0);
      expect(layout.height).toBeGreaterThan(0);
    });

    it('computes layout with custom spacing', () => {
      const layout = computeLayout(samplePeople, sampleRelationships, '1', {
        nodeWidth: 150,
        nodeHeight: 200,
        horizontalSpacing: 60,
        verticalSpacing: 100,
      });

      expect(layout.nodes).toHaveLength(3);
      // With larger spacing, dimensions should be bigger
      expect(layout.width).toBeGreaterThan(0);
      expect(layout.height).toBeGreaterThan(0);
    });

    it('handles empty people array', () => {
      const layout = computeLayout([], []);

      expect(layout.nodes).toHaveLength(0);
      expect(layout.edges).toHaveLength(0);
      expect(layout.width).toBe(0);
      expect(layout.height).toBe(0);
    });

    it('places parents above children', () => {
      const layout = computeLayout(samplePeople, sampleRelationships, '1');

      const father = layout.nodes.find((n) => n.id === '1')!;
      const child = layout.nodes.find((n) => n.id === '3')!;

      expect(father.y).toBeLessThan(child.y);
      expect(father.generation).toBeLessThan(child.generation);
    });

    it('places spouses in same generation', () => {
      const layout = computeLayout(samplePeople, sampleRelationships, '1');

      const father = layout.nodes.find((n) => n.id === '1')!;
      const mother = layout.nodes.find((n) => n.id === '2')!;

      expect(father.generation).toBe(mother.generation);
      expect(father.y).toBe(mother.y);
    });
  });

  describe('theme resolution', () => {
    it('resolves warm theme by default', () => {
      const theme = resolveTheme('warm');

      expect(theme.backgroundColor).toBe('#FFF8F0');
      expect(theme.nodeBorderColor).toBe('#D4A574');
      expect(theme.edgeWidth).toBe(2);
    });

    it('resolves neutral theme', () => {
      const theme = resolveTheme('neutral');

      expect(theme.backgroundColor).toBe('#FAFAFA');
      expect(theme.nodeBorderColor).toBe('#E0E0E0');
      expect(theme.edgeWidth).toBe(1.5);
    });

    it('resolves custom theme', () => {
      const custom = {
        ...warmTheme,
        backgroundColor: '#000000',
        nodeTextColor: '#FFFFFF',
      };
      const theme = resolveTheme('custom', custom);

      expect(theme.backgroundColor).toBe('#000000');
      expect(theme.nodeTextColor).toBe('#FFFFFF');
    });

    it('falls back to warm theme for unknown name', () => {
      const theme = resolveTheme('unknown' as 'warm');

      expect(theme.backgroundColor).toBe(warmTheme.backgroundColor);
    });
  });

  describe('default prop values', () => {
    it('uses default layout config when no overrides', () => {
      const layout = computeLayout(samplePeople, sampleRelationships);

      // Default nodeWidth=120, nodeHeight=160
      // With 3 nodes, width should accommodate at least 2 side-by-side
      expect(layout.nodes).toHaveLength(3);
    });

    it('warm theme has all 9 required fields', () => {
      const fields = [
        'backgroundColor',
        'nodeBackgroundColor',
        'nodeBorderColor',
        'nodeTextColor',
        'edgeColor',
        'edgeWidth',
        'fontFamily',
        'fontSize',
        'photoPlaceholderColor',
      ];

      for (const field of fields) {
        expect(warmTheme).toHaveProperty(field);
      }
    });

    it('neutral theme has all 9 required fields', () => {
      const fields = [
        'backgroundColor',
        'nodeBackgroundColor',
        'nodeBorderColor',
        'nodeTextColor',
        'edgeColor',
        'edgeWidth',
        'fontFamily',
        'fontSize',
        'photoPlaceholderColor',
      ];

      for (const field of fields) {
        expect(neutralTheme).toHaveProperty(field);
      }
    });
  });
});
