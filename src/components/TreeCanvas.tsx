import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { G } from 'react-native-svg';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { Person, TreeTheme, FamilyTreeProps } from '../types';
import type { TreeLayout } from '../layout/types';
import { TreeNode } from './TreeNode';
import { TreeEdge } from './TreeEdge';
import { usePanZoom, type PanZoomConfig } from '../gestures/usePanZoom';
import { useTapHandler } from '../gestures/useTapGesture';

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
  gestureConfig: PanZoomConfig;
}

const PADDING = 40;

/**
 * SVG canvas that renders all tree nodes and edges.
 * Supports pan, pinch-to-zoom, and double-tap-to-reset gestures.
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
  gestureConfig,
}: TreeCanvasProps) {
  const svgWidth = layout.width + PADDING * 2;
  const svgHeight = layout.height + PADDING * 2;

  const { gesture, state } = usePanZoom(gestureConfig);

  const { handleTap, handleLongPress } = useTapHandler({
    nodes: layout.nodes,
    nodeWidth,
    nodeHeight,
    padding: PADDING,
    panZoomState: state,
    onPersonTap,
    onPersonLongPress,
  });

  // Single-tap gesture for node detection (separate from double-tap in usePanZoom)
  const tapGesture = useMemo(() => {
    const { Tap } = require('react-native-gesture-handler').Gesture;
    return Tap()
      .maxDuration(250)
      .onEnd((event: { x: number; y: number }) => {
        handleTap(event.x, event.y);
      });
  }, [handleTap]);

  const longPressGesture = useMemo(() => {
    const { LongPress } = require('react-native-gesture-handler').Gesture;
    return LongPress()
      .minDuration(500)
      .onEnd((event: { x: number; y: number }) => {
        handleLongPress(event.x, event.y);
      });
  }, [handleLongPress]);

  // Compose all gestures: pan+pinch simultaneous, plus tap and long-press
  const composedGesture = useMemo(() => {
    const { Simultaneous, Exclusive } =
      require('react-native-gesture-handler').Gesture;
    const tapGestures = Exclusive(longPressGesture, tapGesture);
    return Simultaneous(gesture, tapGestures);
  }, [gesture, tapGesture, longPressGesture]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: state.translateX.value },
      { translateY: state.translateY.value },
      { scale: state.scale.value },
    ],
  }));

  const edges = useMemo(
    () =>
      layout.edges.map((edge) => {
        if (renderEdge) {
          const fromNode = layout.nodes.find((n) => n.id === edge.fromId);
          const toNode = layout.nodes.find((n) => n.id === edge.toId);
          if (fromNode && toNode) {
            const custom = renderEdge(
              fromNode.person,
              toNode.person,
              edge.type,
            );
            if (custom)
              return (
                <React.Fragment key={`${edge.fromId}-${edge.toId}`}>
                  {custom}
                </React.Fragment>
              );
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
          if (custom)
            return (
              <React.Fragment key={node.id}>{custom}</React.Fragment>
            );
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
    <GestureHandlerRootView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          <Svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            <G transform={`translate(${PADDING}, ${PADDING})`}>
              {edges}
              {nodes}
            </G>
          </Svg>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});
