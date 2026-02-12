import type { GraphNode, LayoutConfig, LayoutNode, LayoutEdge } from './types';
import { buildFamilyUnits } from './spouseLayout';

/**
 * Calculate X/Y positions for all nodes in the graph.
 *
 * Algorithm:
 * 1. Sort generations top-to-bottom (lowest generation number = top row)
 * 2. For each generation, group nodes into family units (couples)
 * 3. Position units left-to-right within each generation
 * 4. Center children below their parent unit's midpoint
 * 5. Second pass: adjust positions to minimize edge crossings
 */
export function calculatePositions(
  graph: Map<string, GraphNode>,
  generations: Map<number, GraphNode[]>,
  config: LayoutConfig,
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing } = config;

  const cellWidth = nodeWidth + horizontalSpacing;
  const cellHeight = nodeHeight + verticalSpacing;

  // Sort generation keys
  const genKeys = Array.from(generations.keys()).sort((a, b) => a - b);

  // Map each node to its x-slot within its generation
  const nodePositions = new Map<string, { x: number; y: number }>();

  // First pass: assign initial positions
  // Process from top generation to bottom
  for (const genKey of genKeys) {
    const genNodes = generations.get(genKey)!;
    const units = buildFamilyUnits(genNodes, graph);
    const y = genKey * cellHeight;

    let xCursor = 0;

    for (const unit of units) {
      // Check if children of this unit have already been positioned
      // If so, center the parents above the children
      const childPositions = unit.children
        .map((childId) => nodePositions.get(childId))
        .filter(Boolean) as Array<{ x: number; y: number }>;

      let unitStartX: number;

      if (childPositions.length > 0) {
        // Center this unit above its children
        const childMinX = Math.min(...childPositions.map((p) => p.x));
        const childMaxX = Math.max(...childPositions.map((p) => p.x));
        const childCenter = (childMinX + childMaxX) / 2;
        const unitWidth = unit.members.length * cellWidth;
        unitStartX = childCenter - unitWidth / 2;
      } else {
        unitStartX = xCursor;
      }

      // Ensure no overlap with already-placed nodes
      unitStartX = Math.max(unitStartX, xCursor);

      for (let i = 0; i < unit.members.length; i++) {
        const member = unit.members[i];
        const x = unitStartX + i * cellWidth;
        nodePositions.set(member.person.id, { x, y });
        xCursor = x + cellWidth;
      }
    }
  }

  // Second pass: center children below parents
  // Process generations from top to bottom again
  for (const genKey of genKeys) {
    const genNodes = generations.get(genKey)!;
    const units = buildFamilyUnits(genNodes, graph);

    for (const unit of units) {
      if (unit.children.length === 0) continue;

      // Find parent midpoint
      const parentPositions = unit.members
        .map((m) => nodePositions.get(m.person.id))
        .filter(Boolean) as Array<{ x: number; y: number }>;

      if (parentPositions.length === 0) continue;

      const parentMinX = Math.min(...parentPositions.map((p) => p.x));
      const parentMaxX = Math.max(...parentPositions.map((p) => p.x));
      const parentCenter = (parentMinX + parentMaxX) / 2;

      // Get children that have been positioned
      const positionedChildren = unit.children.filter((id) =>
        nodePositions.has(id),
      );
      if (positionedChildren.length === 0) continue;

      // Calculate current children center
      const childPos = positionedChildren
        .map((id) => nodePositions.get(id)!)
        .sort((a, b) => a.x - b.x);
      const childMinX = childPos[0].x;
      const childMaxX = childPos[childPos.length - 1].x;
      const childCenter = (childMinX + childMaxX) / 2;

      // Shift children to be centered under parents
      const shift = parentCenter - childCenter;
      if (Math.abs(shift) > 1) {
        for (const childId of positionedChildren) {
          const pos = nodePositions.get(childId)!;
          pos.x += shift;
        }
      }
    }
  }

  // Normalize: shift all positions so the tree starts at (0, 0)
  const allPositions = Array.from(nodePositions.values());
  if (allPositions.length > 0) {
    const minX = Math.min(...allPositions.map((p) => p.x));
    const minY = Math.min(...allPositions.map((p) => p.y));
    for (const pos of allPositions) {
      pos.x -= minX;
      pos.y -= minY;
    }
  }

  // Build LayoutNode array
  const layoutNodes: LayoutNode[] = [];
  for (const [id, pos] of nodePositions) {
    const graphNode = graph.get(id)!;
    layoutNodes.push({
      id,
      person: graphNode.person,
      x: pos.x,
      y: pos.y,
      generation: graphNode.generation,
    });
  }

  // Build edges
  const edges = buildEdges(graph, nodePositions, config);

  return { nodes: layoutNodes, edges };
}

function buildEdges(
  graph: Map<string, GraphNode>,
  positions: Map<string, { x: number; y: number }>,
  config: LayoutConfig,
): LayoutEdge[] {
  const edges: LayoutEdge[] = [];
  const edgeSet = new Set<string>();

  const { nodeWidth, nodeHeight } = config;

  for (const [id, node] of graph) {
    const fromPos = positions.get(id);
    if (!fromPos) continue;

    // Parent → child edges
    for (const childId of node.children) {
      const edgeKey = `${id}->${childId}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      const toPos = positions.get(childId);
      if (!toPos) continue;

      const fromX = fromPos.x + nodeWidth / 2;
      const fromY = fromPos.y + nodeHeight;
      const toX = toPos.x + nodeWidth / 2;
      const toY = toPos.y;

      // Create an L-shaped path through midpoint
      const midY = (fromY + toY) / 2;

      edges.push({
        fromId: id,
        toId: childId,
        type: 'parent',
        points: [
          { x: fromX, y: fromY },
          { x: fromX, y: midY },
          { x: toX, y: midY },
          { x: toX, y: toY },
        ],
      });
    }

    // Spouse edges (horizontal line)
    for (const spouseId of node.spouses) {
      const edgeKey =
        id < spouseId ? `${id}<->${spouseId}` : `${spouseId}<->${id}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      const toPos = positions.get(spouseId);
      if (!toPos) continue;

      const fromX =
        fromPos.x < toPos.x ? fromPos.x + nodeWidth : fromPos.x;
      const toX =
        toPos.x < fromPos.x ? toPos.x + nodeWidth : toPos.x;
      const y = fromPos.y + nodeHeight / 2;

      edges.push({
        fromId: id,
        toId: spouseId,
        type: 'spouse',
        points: [
          { x: fromX, y },
          { x: toX, y },
        ],
      });
    }
  }

  return edges;
}
