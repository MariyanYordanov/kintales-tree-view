import type { Person, Relationship } from '../types';

/**
 * Internal graph node with adjacency information.
 */
export interface GraphNode {
  person: Person;
  parents: string[];
  children: string[];
  spouses: string[];
  generation: number;
}

/**
 * Computed layout for a single node.
 */
export interface LayoutNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  generation: number;
}

/**
 * Computed layout for an edge between two nodes.
 */
export interface LayoutEdge {
  fromId: string;
  toId: string;
  type: string;
  points: Array<{ x: number; y: number }>;
}

/**
 * Complete computed layout result.
 */
export interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

/**
 * Configuration for the layout algorithm.
 */
export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 120,
  nodeHeight: 160,
  horizontalSpacing: 40,
  verticalSpacing: 80,
};
