import { describe, it, expect } from 'vitest';
import { findTappedNode, type TapContext } from '../../src/gestures/useTapGesture';
import type { LayoutNode } from '../../src/layout/types';
import type { SharedValue } from 'react-native-reanimated';

/** Minimal SharedValue mock — only `.value` is used by findTappedNode. */
function mockSharedValue(val: number): SharedValue<number> {
  return { value: val } as SharedValue<number>;
}

function makeContext(
  nodes: LayoutNode[],
  opts: { translateX?: number; translateY?: number; scale?: number } = {},
): TapContext {
  return {
    nodes,
    nodeWidth: 120,
    nodeHeight: 160,
    padding: 40,
    panZoomState: {
      translateX: mockSharedValue(opts.translateX ?? 0),
      translateY: mockSharedValue(opts.translateY ?? 0),
      scale: mockSharedValue(opts.scale ?? 1),
    },
  };
}

const sampleNodes: LayoutNode[] = [
  {
    id: '1',
    person: { id: '1', name: 'Alice' },
    x: 0,
    y: 0,
    generation: 0,
  },
  {
    id: '2',
    person: { id: '2', name: 'Bob' },
    x: 160,
    y: 0,
    generation: 0,
  },
  {
    id: '3',
    person: { id: '3', name: 'Charlie' },
    x: 80,
    y: 240,
    generation: 1,
  },
];

describe('findTappedNode', () => {
  it('finds node when tapped directly on it (no pan/zoom)', () => {
    const ctx = makeContext(sampleNodes);
    // Tap in the middle of Alice's node: padding(40) + nodeWidth/2(60) = 100
    const node = findTappedNode(100, 120, ctx);
    expect(node).not.toBeNull();
    expect(node!.person.name).toBe('Alice');
  });

  it('finds the second node', () => {
    const ctx = makeContext(sampleNodes);
    // Bob is at x=160, so screen x = 40 + 160 + 60 = 260
    const node = findTappedNode(260, 120, ctx);
    expect(node).not.toBeNull();
    expect(node!.person.name).toBe('Bob');
  });

  it('returns null when tapping empty space', () => {
    const ctx = makeContext(sampleNodes);
    // Tap far to the right where no node exists
    const node = findTappedNode(800, 800, ctx);
    expect(node).toBeNull();
  });

  it('accounts for pan translation', () => {
    // Tree panned 100px to the right
    const ctx = makeContext(sampleNodes, { translateX: 100 });
    // Alice's node screen position is now shifted right by 100
    // So tapping at 200 (= 100 + 40 + 60) should hit Alice
    const node = findTappedNode(200, 120, ctx);
    expect(node).not.toBeNull();
    expect(node!.person.name).toBe('Alice');
  });

  it('accounts for zoom scale', () => {
    // Tree zoomed to 2x
    const ctx = makeContext(sampleNodes, { scale: 2 });
    // At 2x scale, Alice's node center in screen coords = (40 + 60) * 2 = 200
    // But the formula is: treeX = (screenX - translateX) / scale - padding
    // So for Alice center: screenX = 0 => treeX = (screenX)/2 - 40
    // We need treeX to be in [0, 120], so screenX in [80, 320]
    const node = findTappedNode(160, 200, ctx);
    expect(node).not.toBeNull();
    expect(node!.person.name).toBe('Alice');
  });

  it('finds child node in second generation', () => {
    const ctx = makeContext(sampleNodes);
    // Charlie at x=80, y=240. Center screen: (40+80+60, 40+240+80) = (180, 360)
    const node = findTappedNode(180, 360, ctx);
    expect(node).not.toBeNull();
    expect(node!.person.name).toBe('Charlie');
  });

  it('returns null with empty node list', () => {
    const ctx = makeContext([]);
    const node = findTappedNode(100, 100, ctx);
    expect(node).toBeNull();
  });
});
