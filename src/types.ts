/**
 * Represents a person in the family tree.
 */
export interface Person {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  birthYear?: number;
  deathYear?: number;
  [key: string]: unknown;
}

/**
 * Represents a relationship between two people.
 * ALL relationship types are rendered with IDENTICAL visual style.
 * The type field is metadata only — no visual differentiation.
 */
export interface Relationship {
  from: string;
  to: string;
  type:
    | 'parent'
    | 'spouse'
    | 'sibling'
    | 'step_parent'
    | 'step_child'
    | 'step_sibling'
    | 'adopted'
    | 'guardian'
    | string;
  marriageYear?: number;
  divorceYear?: number;
}

/**
 * Theme configuration for the tree.
 */
export interface TreeTheme {
  backgroundColor: string;
  nodeBackgroundColor: string;
  nodeBorderColor: string;
  nodeTextColor: string;
  edgeColor: string;
  edgeWidth: number;
  fontFamily: string;
  fontSize: number;
  photoPlaceholderColor: string;
}

/**
 * Position of a node in the rendered tree.
 */
export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Props for the main FamilyTree component.
 */
export interface FamilyTreeProps {
  people: Person[];
  relationships: Relationship[];
  rootId?: string;
  onPersonTap?: (person: Person) => void;
  onPersonLongPress?: (person: Person) => void;

  // Layout
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;

  // Appearance
  theme?: 'warm' | 'neutral' | 'custom';
  customTheme?: TreeTheme;
  showPhotos?: boolean;
  showDates?: boolean;
  photoShape?: 'circle' | 'rounded';
  deceasedStyle?: 'dim' | 'sepia' | 'none';

  // Gestures
  enablePan?: boolean;
  enableZoom?: boolean;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;

  // Advanced
  renderNode?: (person: Person, position: NodePosition) => React.ReactNode;
  renderEdge?: (from: Person, to: Person, type: string) => React.ReactNode;
}
