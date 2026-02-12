import { describe, it, expect } from 'vitest';
import { buildGraph } from '../../src/layout/graphBuilder';
import { buildMultiMarriageGroups } from '../../src/layout/multiMarriageLayout';
import { buildFamilyUnits } from '../../src/layout/spouseLayout';
import { computeLayout } from '../../src/layout/familyLayout';
import type { Person, Relationship } from '../../src/types';

describe('multi-marriage layout', () => {
  const people: Person[] = [
    { id: 'p', name: 'Central Person' },
    { id: 's1', name: 'Spouse 1' },
    { id: 's2', name: 'Spouse 2' },
    { id: 'c1', name: 'Child with S1' },
    { id: 'c2', name: 'Child with S2' },
  ];

  const relationships: Relationship[] = [
    { from: 'p', to: 's1', type: 'spouse' },
    { from: 'p', to: 's2', type: 'spouse' },
    { from: 'p', to: 'c1', type: 'parent' },
    { from: 's1', to: 'c1', type: 'parent' },
    { from: 'p', to: 'c2', type: 'parent' },
    { from: 's2', to: 'c2', type: 'parent' },
  ];

  it('identifies multi-marriage groups', () => {
    const graph = buildGraph(people, relationships);
    const centralNode = graph.get('p')!;

    const group = buildMultiMarriageGroups(centralNode, graph);

    expect(group).not.toBeNull();
    expect(group!.centralPerson.person.id).toBe('p');
    expect(group!.spouseGroups).toHaveLength(2);
  });

  it('assigns children to correct spouse groups', () => {
    const graph = buildGraph(people, relationships);
    const centralNode = graph.get('p')!;

    const group = buildMultiMarriageGroups(centralNode, graph)!;

    const s1Group = group.spouseGroups.find((g) => g.spouse.person.id === 's1');
    const s2Group = group.spouseGroups.find((g) => g.spouse.person.id === 's2');

    expect(s1Group!.children).toContain('c1');
    expect(s2Group!.children).toContain('c2');
  });

  it('returns null for single spouse', () => {
    const graph = buildGraph(
      [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ],
      [{ from: '1', to: '2', type: 'spouse' }],
    );

    const result = buildMultiMarriageGroups(graph.get('1')!, graph);
    expect(result).toBeNull();
  });

  it('builds family units grouping spouses together', () => {
    const graph = buildGraph(people, relationships);
    // All spouses are in same generation
    const genNodes = Array.from(graph.values()).filter(
      (n) => n.generation === 0,
    );

    const units = buildFamilyUnits(genNodes, graph);

    // Should create one unit with p, s1, s2 together
    expect(units.length).toBeGreaterThanOrEqual(1);

    const allMembers = units.flatMap((u) => u.members.map((m) => m.person.id));
    expect(allMembers).toContain('p');
    expect(allMembers).toContain('s1');
    expect(allMembers).toContain('s2');
  });

  it('computes full layout without crashing', () => {
    const result = computeLayout(people, relationships, 'p');

    expect(result.nodes).toHaveLength(5);
    expect(result.edges.length).toBeGreaterThan(0);

    // Parents should be above children
    const p = result.nodes.find((n) => n.id === 'p')!;
    const c1 = result.nodes.find((n) => n.id === 'c1')!;
    expect(p.y).toBeLessThan(c1.y);
  });
});
