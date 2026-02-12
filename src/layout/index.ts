export { computeLayout } from './familyLayout';
export { buildGraph, assignGenerations, groupByGeneration } from './graphBuilder';
export { buildFamilyUnits } from './spouseLayout';
export { buildMultiMarriageGroups } from './multiMarriageLayout';
export type {
  TreeLayout,
  LayoutNode,
  LayoutEdge,
  LayoutConfig,
  GraphNode,
} from './types';
export { DEFAULT_LAYOUT_CONFIG } from './types';
