import type { GraphNode } from './types';

/**
 * For a person with multiple spouses, determine the ordering of spouses.
 * Spouses are placed alternating left and right of the person.
 *
 * E.g., person with 3 spouses: [Spouse1, Person, Spouse2, Spouse3]
 * or more precisely: spouses arranged around the central person.
 */
export interface MultiMarriageGroup {
  centralPerson: GraphNode;
  spouseGroups: Array<{
    spouse: GraphNode;
    children: string[];
  }>;
}

export function buildMultiMarriageGroups(
  node: GraphNode,
  graph: Map<string, GraphNode>,
): MultiMarriageGroup | null {
  if (node.spouses.length <= 1) return null;

  const spouseGroups: MultiMarriageGroup['spouseGroups'] = [];

  for (const spouseId of node.spouses) {
    const spouseNode = graph.get(spouseId);
    if (!spouseNode) continue;

    // Find children that belong to both this person and this spouse
    const sharedChildren = node.children.filter((childId) =>
      spouseNode.children.includes(childId),
    );

    // Also include children that only belong to the spouse (step-children from spouse's side)
    const spouseOnlyChildren = spouseNode.children.filter(
      (childId) =>
        !node.children.includes(childId) &&
        !spouseGroups.some((g) => g.children.includes(childId)),
    );

    spouseGroups.push({
      spouse: spouseNode,
      children: [...sharedChildren, ...spouseOnlyChildren],
    });
  }

  // Children that belong to the central person but none of the spouses
  const _allSpouseChildren = new Set(spouseGroups.flatMap((g) => g.children));
  const soloChildren = node.children.filter(
    (childId) => !_allSpouseChildren.has(childId),
  );

  // Attach solo children to the first spouse group (or create a virtual one)
  if (soloChildren.length > 0 && spouseGroups.length > 0) {
    spouseGroups[0].children.push(...soloChildren);
  }

  return {
    centralPerson: node,
    spouseGroups,
  };
}
