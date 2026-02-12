import type { GraphNode } from './types';

/**
 * Given a generation of nodes, group spouses together.
 * Returns an ordered list of "units" where each unit is either:
 *   - A single person (no spouse in this tree)
 *   - A couple (person + spouse side by side)
 *
 * We avoid duplicating: if A is spouse of B, we only create one unit [A, B].
 */
export interface FamilyUnit {
  members: GraphNode[];
  children: string[];
}

export function buildFamilyUnits(
  generationNodes: GraphNode[],
  graph: Map<string, GraphNode>,
): FamilyUnit[] {
  const units: FamilyUnit[] = [];
  const placed = new Set<string>();

  for (const node of generationNodes) {
    if (placed.has(node.person.id)) continue;

    const members: GraphNode[] = [node];
    placed.add(node.person.id);

    // Add spouses that are in the same generation
    for (const spouseId of node.spouses) {
      if (placed.has(spouseId)) continue;
      const spouseNode = graph.get(spouseId);
      if (spouseNode && spouseNode.generation === node.generation) {
        members.push(spouseNode);
        placed.add(spouseId);
      }
    }

    // Collect all children of any member of this unit
    const childSet = new Set<string>();
    for (const member of members) {
      for (const childId of member.children) {
        childSet.add(childId);
      }
    }

    units.push({
      members,
      children: Array.from(childSet),
    });
  }

  return units;
}
