import React, { useMemo } from 'react';
import type { FamilyTreeProps } from './types';
import { computeLayout } from './layout/familyLayout';
import { resolveTheme } from './themes';
import { TreeCanvas } from './components/TreeCanvas';

/**
 * Main FamilyTree component.
 * Takes people + relationships and renders an interactive family tree diagram.
 */
export function FamilyTree({
  people,
  relationships,
  rootId,
  onPersonTap,
  onPersonLongPress,

  // Layout
  nodeWidth = 120,
  nodeHeight = 160,
  horizontalSpacing = 40,
  verticalSpacing = 80,

  // Appearance
  theme: themeName = 'warm',
  customTheme,
  showPhotos = true,
  showDates = true,
  photoShape = 'circle',
  deceasedStyle = 'none',

  // Advanced
  renderNode,
  renderEdge,
}: FamilyTreeProps) {
  const theme = useMemo(
    () => resolveTheme(themeName, customTheme),
    [themeName, customTheme],
  );

  const layout = useMemo(
    () =>
      computeLayout(people, relationships, rootId, {
        nodeWidth,
        nodeHeight,
        horizontalSpacing,
        verticalSpacing,
      }),
    [people, relationships, rootId, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing],
  );

  return (
    <TreeCanvas
      layout={layout}
      theme={theme}
      nodeWidth={nodeWidth}
      nodeHeight={nodeHeight}
      showPhotos={showPhotos}
      showDates={showDates}
      photoShape={photoShape}
      deceasedStyle={deceasedStyle}
      onPersonTap={onPersonTap}
      onPersonLongPress={onPersonLongPress}
      renderNode={renderNode}
      renderEdge={renderEdge}
    />
  );
}
