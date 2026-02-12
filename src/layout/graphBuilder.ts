import type { Person, Relationship } from '../types';
import type { GraphNode } from './types';

/**
 * Build an internal graph from people and relationships arrays.
 * Returns a Map of person ID → GraphNode.
 */
export function buildGraph(
  people: Person[],
  relationships: Relationship[],
): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  // Create nodes for all people
  for (const person of people) {
    graph.set(person.id, {
      person,
      parents: [],
      children: [],
      spouses: [],
      generation: 0,
    });
  }

  // Process relationships
  for (const rel of relationships) {
    const fromNode = graph.get(rel.from);
    const toNode = graph.get(rel.to);
    if (!fromNode || !toNode) continue;

    switch (rel.type) {
      case 'parent':
      case 'step_parent':
      case 'adopted':
      case 'guardian':
        // "from" is parent of "to"
        if (!fromNode.children.includes(rel.to)) {
          fromNode.children.push(rel.to);
        }
        if (!toNode.parents.includes(rel.from)) {
          toNode.parents.push(rel.from);
        }
        break;

      case 'spouse':
        if (!fromNode.spouses.includes(rel.to)) {
          fromNode.spouses.push(rel.to);
        }
        if (!toNode.spouses.includes(rel.from)) {
          toNode.spouses.push(rel.from);
        }
        break;

      case 'sibling':
      case 'step_sibling':
        // Siblings share parents — no explicit edge needed for layout.
        // They'll be positioned as children of the same parents.
        break;

      case 'step_child':
        // Reverse of step_parent: "from" is step-child of "to"
        if (!toNode.children.includes(rel.from)) {
          toNode.children.push(rel.from);
        }
        if (!fromNode.parents.includes(rel.to)) {
          fromNode.parents.push(rel.to);
        }
        break;

      default:
        // Unknown relationship type — treat as parent→child
        if (!fromNode.children.includes(rel.to)) {
          fromNode.children.push(rel.to);
        }
        if (!toNode.parents.includes(rel.from)) {
          toNode.parents.push(rel.from);
        }
        break;
    }
  }

  return graph;
}

/**
 * Assign generation numbers using BFS from a root node.
 * Root = generation 0, children = 1, parents = -1, etc.
 * If no rootId is provided, picks the first person with no parents.
 */
export function assignGenerations(
  graph: Map<string, GraphNode>,
  rootId?: string,
): void {
  if (graph.size === 0) return;

  // Find root: provided rootId, or first person with no parents, or just first person
  let startId = rootId;
  if (!startId || !graph.has(startId)) {
    // Find someone with no parents (likely an ancestor)
    for (const [id, node] of graph) {
      if (node.parents.length === 0) {
        startId = id;
        break;
      }
    }
    // Fallback: just pick the first person
    if (!startId) {
      startId = graph.keys().next().value!;
    }
  }

  const visited = new Set<string>();
  const queue: Array<{ id: string; generation: number }> = [
    { id: startId, generation: 0 },
  ];
  visited.add(startId);

  while (queue.length > 0) {
    const { id, generation } = queue.shift()!;
    const node = graph.get(id);
    if (!node) continue;

    node.generation = generation;

    // Children are one generation below
    for (const childId of node.children) {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push({ id: childId, generation: generation + 1 });
      }
    }

    // Parents are one generation above
    for (const parentId of node.parents) {
      if (!visited.has(parentId)) {
        visited.add(parentId);
        queue.push({ id: parentId, generation: generation - 1 });
      }
    }

    // Spouses are at the same generation
    for (const spouseId of node.spouses) {
      if (!visited.has(spouseId)) {
        visited.add(spouseId);
        queue.push({ id: spouseId, generation });
      }
    }
  }

  // Handle disconnected components — assign generation 0
  for (const [id, node] of graph) {
    if (!visited.has(id)) {
      node.generation = 0;
      visited.add(id);
      // BFS from this node too
      const subQueue: Array<{ id: string; generation: number }> = [
        { id, generation: 0 },
      ];
      while (subQueue.length > 0) {
        const { id: subId, generation: subGen } = subQueue.shift()!;
        const subNode = graph.get(subId);
        if (!subNode) continue;
        subNode.generation = subGen;

        for (const childId of subNode.children) {
          if (!visited.has(childId)) {
            visited.add(childId);
            subQueue.push({ id: childId, generation: subGen + 1 });
          }
        }
        for (const parentId of subNode.parents) {
          if (!visited.has(parentId)) {
            visited.add(parentId);
            subQueue.push({ id: parentId, generation: subGen - 1 });
          }
        }
        for (const spouseId of subNode.spouses) {
          if (!visited.has(spouseId)) {
            visited.add(spouseId);
            subQueue.push({ id: spouseId, generation: subGen });
          }
        }
      }
    }
  }
}

/**
 * Group nodes by their generation level.
 */
export function groupByGeneration(
  graph: Map<string, GraphNode>,
): Map<number, GraphNode[]> {
  const generations = new Map<number, GraphNode[]>();
  for (const node of graph.values()) {
    const gen = node.generation;
    if (!generations.has(gen)) {
      generations.set(gen, []);
    }
    generations.get(gen)!.push(node);
  }
  return generations;
}
