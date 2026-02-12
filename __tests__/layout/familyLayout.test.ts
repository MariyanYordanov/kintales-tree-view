import { describe, it, expect } from 'vitest';
import { computeLayout } from '../../src/layout/familyLayout';
import type { Person, Relationship } from '../../src/types';

describe('computeLayout', () => {
  it('returns empty layout for empty input', () => {
    const result = computeLayout([], []);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it('positions a single person at origin', () => {
    const people: Person[] = [{ id: '1', name: 'Alice' }];
    const result = computeLayout(people, []);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].x).toBe(0);
    expect(result.nodes[0].y).toBe(0);
    expect(result.nodes[0].person.name).toBe('Alice');
  });

  it('positions two spouses side by side', () => {
    const people: Person[] = [
      { id: '1', name: 'Husband' },
      { id: '2', name: 'Wife' },
    ];
    const relationships: Relationship[] = [
      { from: '1', to: '2', type: 'spouse' },
    ];

    const result = computeLayout(people, relationships);

    expect(result.nodes).toHaveLength(2);
    // Same generation (same y)
    expect(result.nodes[0].y).toBe(result.nodes[1].y);
    // Side by side (different x)
    expect(result.nodes[0].x).not.toBe(result.nodes[1].x);
  });

  it('positions parent above child', () => {
    const people: Person[] = [
      { id: '1', name: 'Parent' },
      { id: '2', name: 'Child' },
    ];
    const relationships: Relationship[] = [
      { from: '1', to: '2', type: 'parent' },
    ];

    const result = computeLayout(people, relationships);

    const parent = result.nodes.find((n) => n.id === '1')!;
    const child = result.nodes.find((n) => n.id === '2')!;

    expect(parent.y).toBeLessThan(child.y);
  });

  it('handles nuclear family: 2 parents + 2 kids', () => {
    const people: Person[] = [
      { id: 'dad', name: 'Dad' },
      { id: 'mom', name: 'Mom' },
      { id: 'child1', name: 'Child 1' },
      { id: 'child2', name: 'Child 2' },
    ];
    const relationships: Relationship[] = [
      { from: 'dad', to: 'mom', type: 'spouse' },
      { from: 'dad', to: 'child1', type: 'parent' },
      { from: 'mom', to: 'child1', type: 'parent' },
      { from: 'dad', to: 'child2', type: 'parent' },
      { from: 'mom', to: 'child2', type: 'parent' },
    ];

    const result = computeLayout(people, relationships);

    expect(result.nodes).toHaveLength(4);

    const dad = result.nodes.find((n) => n.id === 'dad')!;
    const mom = result.nodes.find((n) => n.id === 'mom')!;
    const child1 = result.nodes.find((n) => n.id === 'child1')!;
    const child2 = result.nodes.find((n) => n.id === 'child2')!;

    // Parents same generation
    expect(dad.y).toBe(mom.y);
    // Children same generation
    expect(child1.y).toBe(child2.y);
    // Parents above children
    expect(dad.y).toBeLessThan(child1.y);
  });

  it('handles 3 generations', () => {
    const people: Person[] = [
      { id: 'gp', name: 'Grandparent' },
      { id: 'p', name: 'Parent' },
      { id: 'c', name: 'Child' },
    ];
    const relationships: Relationship[] = [
      { from: 'gp', to: 'p', type: 'parent' },
      { from: 'p', to: 'c', type: 'parent' },
    ];

    const result = computeLayout(people, relationships, 'gp');

    const gp = result.nodes.find((n) => n.id === 'gp')!;
    const p = result.nodes.find((n) => n.id === 'p')!;
    const c = result.nodes.find((n) => n.id === 'c')!;

    expect(gp.y).toBeLessThan(p.y);
    expect(p.y).toBeLessThan(c.y);
  });

  it('creates parent→child edges', () => {
    const people: Person[] = [
      { id: '1', name: 'Parent' },
      { id: '2', name: 'Child' },
    ];
    const relationships: Relationship[] = [
      { from: '1', to: '2', type: 'parent' },
    ];

    const result = computeLayout(people, relationships);

    const parentEdges = result.edges.filter((e) => e.type === 'parent');
    expect(parentEdges).toHaveLength(1);
    expect(parentEdges[0].fromId).toBe('1');
    expect(parentEdges[0].toId).toBe('2');
    expect(parentEdges[0].points.length).toBeGreaterThanOrEqual(2);
  });

  it('creates spouse edges', () => {
    const people: Person[] = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ];
    const relationships: Relationship[] = [
      { from: '1', to: '2', type: 'spouse' },
    ];

    const result = computeLayout(people, relationships);

    const spouseEdges = result.edges.filter((e) => e.type === 'spouse');
    expect(spouseEdges).toHaveLength(1);
  });

  it('respects custom layout config', () => {
    const people: Person[] = [
      { id: '1', name: 'Parent' },
      { id: '2', name: 'Child' },
    ];
    const relationships: Relationship[] = [
      { from: '1', to: '2', type: 'parent' },
    ];

    const result = computeLayout(people, relationships, undefined, {
      nodeWidth: 200,
      nodeHeight: 200,
      verticalSpacing: 100,
    });

    const parent = result.nodes.find((n) => n.id === '1')!;
    const child = result.nodes.find((n) => n.id === '2')!;

    // Vertical distance should be nodeHeight + verticalSpacing = 300
    expect(child.y - parent.y).toBe(300);
  });
});
