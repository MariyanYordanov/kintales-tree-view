import { describe, it, expect } from 'vitest';
import { computeLayout } from '../../src/layout/familyLayout';
import { buildGraph, assignGenerations } from '../../src/layout/graphBuilder';
import type { Person, Relationship } from '../../src/types';

describe('edge cases', () => {
  it('handles person with no relationships', () => {
    const people: Person[] = [
      { id: '1', name: 'Loner' },
      { id: '2', name: 'Also Alone' },
    ];

    const result = computeLayout(people, []);
    expect(result.nodes).toHaveLength(2);
    // Both should be positioned without error
    expect(result.nodes[0].x).toBeDefined();
    expect(result.nodes[1].x).toBeDefined();
  });

  it('handles relationships referencing non-existent people', () => {
    const people: Person[] = [{ id: '1', name: 'Exists' }];
    const relationships: Relationship[] = [
      { from: '1', to: 'ghost', type: 'parent' },
    ];

    // Should not crash
    const result = computeLayout(people, relationships);
    expect(result.nodes).toHaveLength(1);
  });

  it('handles duplicate relationships', () => {
    const people: Person[] = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ];
    const relationships: Relationship[] = [
      { from: '1', to: '2', type: 'spouse' },
      { from: '1', to: '2', type: 'spouse' }, // duplicate
      { from: '2', to: '1', type: 'spouse' }, // reverse duplicate
    ];

    const graph = buildGraph(people, relationships);
    const nodeA = graph.get('1')!;
    // Should not have duplicate spouse entries
    expect(nodeA.spouses).toHaveLength(1);
  });

  it('handles person with 3 spouses', () => {
    const people: Person[] = [
      { id: 'p', name: 'Person' },
      { id: 's1', name: 'Spouse 1' },
      { id: 's2', name: 'Spouse 2' },
      { id: 's3', name: 'Spouse 3' },
    ];
    const relationships: Relationship[] = [
      { from: 'p', to: 's1', type: 'spouse' },
      { from: 'p', to: 's2', type: 'spouse' },
      { from: 'p', to: 's3', type: 'spouse' },
    ];

    const result = computeLayout(people, relationships);
    expect(result.nodes).toHaveLength(4);

    // All should be at the same generation (y)
    const ys = result.nodes.map((n) => n.y);
    expect(new Set(ys).size).toBe(1);
  });

  it('handles step_child relationship (reverse direction)', () => {
    const people: Person[] = [
      { id: '1', name: 'Step-child' },
      { id: '2', name: 'Step-parent' },
    ];
    const relationships: Relationship[] = [
      { from: '1', to: '2', type: 'step_child' },
    ];

    const graph = buildGraph(people, relationships);
    const parent = graph.get('2')!;
    const child = graph.get('1')!;

    expect(parent.children).toContain('1');
    expect(child.parents).toContain('2');
  });

  it('handles disconnected family groups', () => {
    const people: Person[] = [
      { id: 'a1', name: 'Family A Parent' },
      { id: 'a2', name: 'Family A Child' },
      { id: 'b1', name: 'Family B Parent' },
      { id: 'b2', name: 'Family B Child' },
    ];
    const relationships: Relationship[] = [
      { from: 'a1', to: 'a2', type: 'parent' },
      { from: 'b1', to: 'b2', type: 'parent' },
    ];

    const result = computeLayout(people, relationships);
    expect(result.nodes).toHaveLength(4);
    // Should not crash — all nodes should have valid positions
    for (const node of result.nodes) {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
  });

  it('handles large tree (50 nodes) without crashing', () => {
    const people: Person[] = [];
    const relationships: Relationship[] = [];

    // Build a chain: person 0 → person 1 → ... → person 49
    for (let i = 0; i < 50; i++) {
      people.push({ id: `${i}`, name: `Person ${i}` });
      if (i > 0) {
        relationships.push({ from: `${i - 1}`, to: `${i}`, type: 'parent' });
      }
    }

    const result = computeLayout(people, relationships, '0');
    expect(result.nodes).toHaveLength(50);
    expect(result.edges.length).toBeGreaterThan(0);
  });

  it('generation assignment handles root with parents', () => {
    // Root in middle of tree — parents should get negative generations
    const people: Person[] = [
      { id: 'grandpa', name: 'Grandpa' },
      { id: 'dad', name: 'Dad' },
      { id: 'me', name: 'Me' },
      { id: 'child', name: 'Child' },
    ];
    const relationships: Relationship[] = [
      { from: 'grandpa', to: 'dad', type: 'parent' },
      { from: 'dad', to: 'me', type: 'parent' },
      { from: 'me', to: 'child', type: 'parent' },
    ];

    const graph = buildGraph(people, relationships);
    assignGenerations(graph, 'me');

    expect(graph.get('me')!.generation).toBe(0);
    expect(graph.get('dad')!.generation).toBe(-1);
    expect(graph.get('grandpa')!.generation).toBe(-2);
    expect(graph.get('child')!.generation).toBe(1);
  });
});
