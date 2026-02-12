import { describe, it, expect } from 'vitest';
import { isNodeVisible, cullNodes } from '../../src/utils/viewportCulling';

describe('viewportCulling', () => {
  const viewport = { x: 0, y: 0, width: 800, height: 600, scale: 1 };

  describe('isNodeVisible', () => {
    it('returns true for node inside viewport', () => {
      expect(
        isNodeVisible({ x: 100, y: 100, width: 120, height: 160 }, viewport),
      ).toBe(true);
    });

    it('returns false for node far outside viewport', () => {
      expect(
        isNodeVisible({ x: 2000, y: 2000, width: 120, height: 160 }, viewport),
      ).toBe(false);
    });

    it('returns true for node partially visible', () => {
      expect(
        isNodeVisible({ x: 750, y: 550, width: 120, height: 160 }, viewport),
      ).toBe(true);
    });

    it('accounts for margin', () => {
      // Node just outside viewport but within margin
      expect(
        isNodeVisible(
          { x: -150, y: 0, width: 120, height: 160 },
          viewport,
          200,
        ),
      ).toBe(true);
    });

    it('accounts for scale', () => {
      const zoomedOut = { ...viewport, scale: 0.5 };
      // At scale 0.5, viewport effectively shows 1600x1200
      expect(
        isNodeVisible(
          { x: 1000, y: 0, width: 120, height: 160 },
          zoomedOut,
        ),
      ).toBe(true);
    });
  });

  describe('cullNodes', () => {
    it('filters out non-visible nodes', () => {
      const nodes = [
        { id: 'a', position: { x: 100, y: 100, width: 120, height: 160 } },
        { id: 'b', position: { x: 3000, y: 3000, width: 120, height: 160 } },
        { id: 'c', position: { x: 400, y: 300, width: 120, height: 160 } },
      ];

      const visible = cullNodes(nodes, viewport);
      expect(visible).toHaveLength(2);
      expect(visible.map((n) => n.id)).toEqual(['a', 'c']);
    });
  });
});
