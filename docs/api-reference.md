# API Reference

## Components

### `<FamilyTree />`

Main component that renders an interactive family tree.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `people` | `Person[]` | **required** | Array of people |
| `relationships` | `Relationship[]` | **required** | Array of relationships |
| `rootId` | `string` | auto-detected | Person to center the tree on |
| `onPersonTap` | `(person: Person) => void` | — | Tap callback |
| `onPersonLongPress` | `(person: Person) => void` | — | Long-press callback |
| `nodeWidth` | `number` | `120` | Node width in pixels |
| `nodeHeight` | `number` | `160` | Node height in pixels |
| `horizontalSpacing` | `number` | `40` | Gap between nodes |
| `verticalSpacing` | `number` | `80` | Gap between generations |
| `theme` | `'warm' \| 'neutral' \| 'custom'` | `'warm'` | Theme selection |
| `customTheme` | `TreeTheme` | — | Custom theme (requires `theme='custom'`) |
| `showPhotos` | `boolean` | `true` | Show photo/initials |
| `showDates` | `boolean` | `true` | Show birth/death labels |
| `photoShape` | `'circle' \| 'rounded'` | `'circle'` | Photo shape |
| `deceasedStyle` | `'dim' \| 'sepia' \| 'none'` | `'none'` | Deceased visual style |
| `enablePan` | `boolean` | `true` | Enable drag to pan |
| `enableZoom` | `boolean` | `true` | Enable pinch to zoom |
| `minZoom` | `number` | `0.3` | Minimum zoom level |
| `maxZoom` | `number` | `3.0` | Maximum zoom level |
| `initialZoom` | `number` | `1.0` | Starting zoom |
| `renderNode` | `(person: Person, position: NodePosition) => ReactNode` | — | Custom node renderer |
| `renderEdge` | `(from: Person, to: Person, type: string) => ReactNode` | — | Custom edge renderer |

## Functions

### `computeLayout(people, relationships, rootId?, config?)`

Pure function that computes the tree layout without rendering.

```typescript
import { computeLayout } from '@kintales/tree-view';

const layout = computeLayout(people, relationships, 'root-id', {
  nodeWidth: 120,
  nodeHeight: 160,
  horizontalSpacing: 40,
  verticalSpacing: 80,
});
```

**Returns:** `TreeLayout`
- `nodes: LayoutNode[]` — Array of `{ id, person, x, y, generation }`
- `edges: LayoutEdge[]` — Array of `{ fromId, toId, type, points }`
- `width: number` — Total tree width
- `height: number` — Total tree height

### `resolveTheme(name, customTheme?)`

Resolves a theme name to a `TreeTheme` object.

### `getInitials(name)`

Extracts initials from a name: `"Ivan Petrov"` → `"IP"`.

### `formatDateLabel(birthYear?, deathYear?)`

Formats a date label: `formatDateLabel(1940, 2020)` → `"1940 — 2020"`.

### `isNodeVisible(node, viewport, margin?)`

Determines if a node is within the visible viewport.

### `cullNodes(nodes, viewport, margin?)`

Filters an array of positioned nodes to only those visible.

## Types

### `Person`

```typescript
interface Person {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  birthYear?: number;
  deathYear?: number;
  [key: string]: unknown;
}
```

### `Relationship`

```typescript
interface Relationship {
  from: string;
  to: string;
  type: 'parent' | 'spouse' | 'sibling' | 'step_parent'
      | 'step_child' | 'step_sibling' | 'adopted' | 'guardian' | string;
  marriageYear?: number;
  divorceYear?: number;
}
```

### `TreeTheme`

```typescript
interface TreeTheme {
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
```

### `NodePosition`

```typescript
interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### `TreeLayout`

```typescript
interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}
```

### `LayoutNode`

```typescript
interface LayoutNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  generation: number;
}
```

### `LayoutEdge`

```typescript
interface LayoutEdge {
  fromId: string;
  toId: string;
  type: string;
  points: Array<{ x: number; y: number }>;
}
```

### `Viewport`

```typescript
interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}
```
