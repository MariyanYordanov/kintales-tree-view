// Main component
export { FamilyTree } from './FamilyTree';

// Layout (for advanced usage)
export { computeLayout } from './layout/familyLayout';

// Themes
export { warmTheme } from './themes/warm';
export { neutralTheme } from './themes/neutral';
export { resolveTheme } from './themes';

// Types
export type {
  Person,
  Relationship,
  FamilyTreeProps,
  TreeTheme,
  NodePosition,
} from './types';

export type {
  TreeLayout,
  LayoutNode,
  LayoutEdge,
  LayoutConfig,
} from './layout/types';

// Utils
export { getInitials } from './utils/initials';
export { formatDateLabel } from './utils/dateFormat';
