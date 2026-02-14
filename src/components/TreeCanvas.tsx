import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Svg, { G } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import type { Person, TreeTheme, FamilyTreeProps } from '../types';
import type { TreeLayout, LayoutNode, LayoutEdge } from '../layout/types';
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
/** Only activate viewport culling when node count exceeds this threshold. */
const CULLING_THRESHOLD = 50;
/** Extra margin (in tree-space units) around the viewport for culling. */
const CULLING_MARGIN = 200;

interface VisibleBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * SVG canvas that renders all tree nodes and edges.
 * Supports pan, pinch-to-zoom, and double-tap-to-reset gestures.
 * For large trees (50+ nodes), viewport culling skips off-screen nodes.
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

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [visibleBounds, setVisibleBounds] = useState<VisibleBounds | null>(
    null,
  );

  const enableCulling = layout.nodes.length > CULLING_THRESHOLD;

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  const { gesture, state } = usePanZoom(gestureConfig);

  // Track viewport changes for culling (grid-snapped to reduce re-renders)
  const updateVisibleBounds = useCallback(
    (bounds: VisibleBounds) => {
      setVisibleBounds(bounds);
    },
    [],
  );

  useAnimatedReaction(
    () => {
      // Snap to 50px grid to reduce update frequency
      const tx = Math.round(state.translateX.value / 50) * 50;
      const ty = Math.round(state.translateY.value / 50) * 50;
      const s = Math.round(state.scale.value * 10) / 10;
      return `${tx},${ty},${s}`;
    },
    (current, previous) => {
      if (current === previous) return;
      if (!enableCulling || containerSize.width === 0) return;

      const parts = current.split(',');
      const tx = Number(parts[0]);
      const ty = Number(parts[1]);
      const s = Number(parts[2]) || 1;

      const left = -tx / s - PADDING - CULLING_MARGIN;
      const top = -ty / s - PADDING - CULLING_MARGIN;
      const right = (containerSize.width - tx) / s - PADDING + CULLING_MARGIN;
      const bottom =
        (containerSize.height - ty) / s - PADDING + CULLING_MARGIN;

      runOnJS(updateVisibleBounds)({ left, top, right, bottom });
    },
    [enableCulling, containerSize],
  );

  // Filter nodes/edges by visibility
  const visibleNodes: LayoutNode[] = useMemo(() => {
    if (!enableCulling || !visibleBounds) return layout.nodes;
    return layout.nodes.filter(
      (node) =>
        node.x + nodeWidth > visibleBounds.left &&
        node.x < visibleBounds.right &&
        node.y + nodeHeight > visibleBounds.top &&
        node.y < visibleBounds.bottom,
    );
  }, [layout.nodes, visibleBounds, enableCulling, nodeWidth, nodeHeight]);

  const visibleNodeIds = useMemo(() => {
    if (!enableCulling) return null;
    return new Set(visibleNodes.map((n) => n.id));
  }, [visibleNodes, enableCulling]);

  const visibleEdges: LayoutEdge[] = useMemo(() => {
    if (!enableCulling || !visibleNodeIds) return layout.edges;
    return layout.edges.filter(
      (edge) =>
        visibleNodeIds.has(edge.fromId) || visibleNodeIds.has(edge.toId),
    );
  }, [layout.edges, visibleNodeIds, enableCulling]);

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
  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDuration(250)
        .onEnd((event: { x: number; y: number }) => {
          handleTap(event.x, event.y);
        }),
    [handleTap],
  );

  const longPressGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(500)
        .onEnd((event: { x: number; y: number }) => {
          handleLongPress(event.x, event.y);
        }),
    [handleLongPress],
  );

  // Compose all gestures: pan+pinch simultaneous, plus tap and long-press
  const composedGesture = useMemo(() => {
    const tapGestures = Gesture.Exclusive(longPressGesture, tapGesture);
    return Gesture.Simultaneous(gesture, tapGestures);
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
      visibleEdges.map((edge) => {
        if (renderEdge) {
          const fromNode = visibleNodes.find((n) => n.id === edge.fromId);
          const toNode = visibleNodes.find((n) => n.id === edge.toId);
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
    [visibleEdges, visibleNodes, theme, renderEdge],
  );

  const nodes = useMemo(
    () =>
      visibleNodes.map((node) => {
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
      visibleNodes,
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
      onLayout={onContainerLayout}
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
