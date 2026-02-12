import type { NodePosition } from '../types';

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

/**
 * Determine if a node is within the visible viewport (with some margin).
 * Used to skip rendering off-screen nodes for performance.
 */
export function isNodeVisible(
  node: NodePosition,
  viewport: Viewport,
  margin = 100,
): boolean {
  const viewLeft = viewport.x - margin;
  const viewRight = viewport.x + viewport.width / viewport.scale + margin;
  const viewTop = viewport.y - margin;
  const viewBottom = viewport.y + viewport.height / viewport.scale + margin;

  return (
    node.x + node.width > viewLeft &&
    node.x < viewRight &&
    node.y + node.height > viewTop &&
    node.y < viewBottom
  );
}

/**
 * Filter an array of positioned nodes to only those visible in the viewport.
 */
export function cullNodes<T extends { position: NodePosition }>(
  nodes: T[],
  viewport: Viewport,
  margin = 100,
): T[] {
  return nodes.filter((n) => isNodeVisible(n.position, viewport, margin));
}
