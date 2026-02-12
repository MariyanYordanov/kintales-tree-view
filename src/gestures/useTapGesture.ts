import { useCallback } from 'react';
import type { Person } from '../types';
import type { LayoutNode } from '../layout/types';
import type { PanZoomState } from './usePanZoom';

interface TapContext {
  nodes: LayoutNode[];
  nodeWidth: number;
  nodeHeight: number;
  padding: number;
  panZoomState: PanZoomState;
  onPersonTap?: (person: Person) => void;
  onPersonLongPress?: (person: Person) => void;
}

/**
 * Determines which node (if any) was tapped at the given screen coordinates.
 * Accounts for current pan/zoom transform.
 */
function findTappedNode(
  screenX: number,
  screenY: number,
  context: TapContext,
): LayoutNode | null {
  const { nodes, nodeWidth, nodeHeight, padding, panZoomState } = context;
  const { translateX, translateY, scale } = panZoomState;

  // Convert screen coordinates to tree coordinates
  const treeX = (screenX - translateX.value) / scale.value - padding;
  const treeY = (screenY - translateY.value) / scale.value - padding;

  // Find the node that contains this point
  for (const node of nodes) {
    if (
      treeX >= node.x &&
      treeX <= node.x + nodeWidth &&
      treeY >= node.y &&
      treeY <= node.y + nodeHeight
    ) {
      return node;
    }
  }

  return null;
}

/**
 * Hook that provides tap-on-node detection.
 * Returns handlers to be used with the TreeCanvas touch events.
 */
export function useTapHandler(context: TapContext) {
  const handleTap = useCallback(
    (screenX: number, screenY: number) => {
      if (!context.onPersonTap) return;

      const node = findTappedNode(screenX, screenY, context);
      if (node) {
        context.onPersonTap(node.person);
      }
    },
    [context],
  );

  const handleLongPress = useCallback(
    (screenX: number, screenY: number) => {
      if (!context.onPersonLongPress) return;

      const node = findTappedNode(screenX, screenY, context);
      if (node) {
        context.onPersonLongPress(node.person);
      }
    },
    [context],
  );

  return { handleTap, handleLongPress };
}

export { findTappedNode };
