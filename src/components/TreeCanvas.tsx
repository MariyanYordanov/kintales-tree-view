import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G } from 'react-native-svg';
import type { Person, TreeTheme, FamilyTreeProps } from '../types';
import type { TreeLayout } from '../layout/types';
import { TreeNode } from './TreeNode';
import { TreeEdge } from './TreeEdge';

interface TreeCanvasProps {
  layout: TreeLayout;
  theme: TreeTheme;
  nodeWidth: number;
  nodeHeight: number;
  showPhotos: boolean;
  showDates: boolean;
  photoShape: 'circle' | 'rounded';
  deceasedStyle: 'dim' | 'sepia' | 'none';
  onPersonTap?: (person: Person) => void;
  onPersonLongPress?: (person: Person) => void;
  renderNode?: FamilyTreeProps['renderNode'];
  renderEdge?: FamilyTreeProps['renderEdge'];
}

/**
 * SVG canvas that renders all tree nodes and edges.
 * In v0.1, this is a static (non-gesture) canvas.
 * Gesture support (pan/zoom) will be added in v0.2.
 */
export const TreeCanvas = React.memo(function TreeCanvas({
  layout,
  theme,
  nodeWidth,
  nodeHeight,
  showPhotos,
  showDates,
  photoShape,
  deceasedStyle,
  onPersonTap,
  onPersonLongPress,
  renderNode,
  renderEdge,
}: TreeCanvasProps) {
  const padding = 40;
  const svgWidth = layout.width + padding * 2;
  const svgHeight = layout.height + padding * 2;

  const edges = useMemo(
    () =>
      layout.edges.map((edge) => {
        if (renderEdge) {
          const fromNode = layout.nodes.find((n) => n.id === edge.fromId);
          const toNode = layout.nodes.find((n) => n.id === edge.toId);
          if (fromNode && toNode) {
            const custom = renderEdge(fromNode.person, toNode.person, edge.type);
            if (custom) return <React.Fragment key={`${edge.fromId}-${edge.toId}`}>{custom}</React.Fragment>;
          }
        }
        return (
          <TreeEdge
            key={`${edge.fromId}-${edge.toId}`}
            edge={edge}
            theme={theme}
          />
        );
      }),
    [layout.edges, layout.nodes, theme, renderEdge],
  );

  const nodes = useMemo(
    () =>
      layout.nodes.map((node) => {
        if (renderNode) {
          const custom = renderNode(node.person, {
            x: node.x,
            y: node.y,
            width: nodeWidth,
            height: nodeHeight,
          });
          if (custom) return <React.Fragment key={node.id}>{custom}</React.Fragment>;
        }
        return (
          <TreeNode
            key={node.id}
            person={node.person}
            x={node.x}
            y={node.y}
            width={nodeWidth}
            height={nodeHeight}
            theme={theme}
            showPhotos={showPhotos}
            showDates={showDates}
            photoShape={photoShape}
            deceasedStyle={deceasedStyle}
            onTap={onPersonTap}
            onLongPress={onPersonLongPress}
          />
        );
      }),
    [
      layout.nodes,
      nodeWidth,
      nodeHeight,
      theme,
      showPhotos,
      showDates,
      photoShape,
      deceasedStyle,
      onPersonTap,
      onPersonLongPress,
      renderNode,
    ],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <G transform={`translate(${padding}, ${padding})`}>
          {edges}
          {nodes}
        </G>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
