import React from 'react';
import { Path } from 'react-native-svg';
import type { TreeTheme } from '../types';
import type { LayoutEdge } from '../layout/types';

interface TreeEdgeProps {
  edge: LayoutEdge;
  theme: TreeTheme;
}

/**
 * Renders a single edge (line) between two nodes.
 * ALL edge types use identical visual style — same color, width, no dashes.
 */
export const TreeEdge = React.memo(function TreeEdge({
  edge,
  theme,
}: TreeEdgeProps) {
  if (edge.points.length < 2) return null;

  const pathData = edge.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <Path
      d={pathData}
      stroke={theme.edgeColor}
      strokeWidth={theme.edgeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
});
