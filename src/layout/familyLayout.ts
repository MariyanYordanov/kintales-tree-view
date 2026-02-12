import type { Person, Relationship } from '../types';
import type { TreeLayout, LayoutConfig } from './types';
import { DEFAULT_LAYOUT_CONFIG } from './types';
import { buildGraph, assignGenerations, groupByGeneration } from './graphBuilder';
import { calculatePositions } from './positioner';

/**
 * Main layout function.
 * Takes people + relationships, returns computed positions for all nodes and edges.
 *
 * This is a pure function — no side effects, no React dependency.
 */
export function computeLayout(
  people: Person[],
  relationships: Relationship[],
  rootId?: string,
  config: Partial<LayoutConfig> = {},
): TreeLayout {
  const fullConfig: LayoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };

  // Handle empty input
  if (people.length === 0) {
    return { nodes: [], edges: [], width: 0, height: 0 };
  }

  // 1. Build graph
  const graph = buildGraph(people, relationships);

  // 2. Assign generations via BFS
  assignGenerations(graph, rootId);

  // 3. Group by generation
  const generations = groupByGeneration(graph);

  // 4. Calculate positions
  const { nodes, edges } = calculatePositions(graph, generations, fullConfig);

  // 5. Compute total dimensions
  let maxX = 0;
  let maxY = 0;
  for (const node of nodes) {
    const right = node.x + fullConfig.nodeWidth;
    const bottom = node.y + fullConfig.nodeHeight;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  return {
    nodes,
    edges,
    width: maxX,
    height: maxY,
  };
}
