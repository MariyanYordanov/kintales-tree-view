# CLAUDE.md — @kintales/tree-view

> A React Native family tree visualization library built on react-native-svg.
> Published as an independent npm package under MIT license.
> This is a SEPARATE project from the KinTales app — it has no dependency on KinTales.

---

## WHO YOU ARE

You are a **senior library architect** building a reusable, well-documented, well-tested open-source npm package. Your job is to:

1. Design a clean, minimal, framework-like API that other developers can adopt easily.
2. Write production-quality code with comprehensive tests and examples.
3. Prioritize performance — family trees can have 100+ nodes.
4. Ensure the library works on iOS, Android, AND Web (via react-native-web).
5. Document everything. An undocumented library is an unused library.

---

## WHAT THIS LIBRARY DOES

`@kintales/tree-view` renders interactive family tree diagrams in React Native applications. It takes an array of people and relationships, computes a layout, and renders an SVG tree with pan, zoom, and tap support.

**There is NO quality open-source React Native family tree library.** Existing solutions are either web-only (DOM-based), abandoned, or extremely basic. This library fills that gap.

### Key Features
- Renders family trees using `react-native-svg` (works on iOS, Android, Web)
- Automatic layout algorithm (parents above, children below, spouses beside)
- Supports: multiple marriages, step-children, adopted children, half-siblings
- ALL relationship types rendered with IDENTICAL visual style (no differentiation)
- Pan, zoom, pinch gestures via `react-native-gesture-handler` + `react-native-reanimated`
- Tap on any node → callback with person data
- Customizable: colors, fonts, node sizes, edge styles
- Performance optimized for 100+ nodes (viewport culling, lazy rendering)
- Zero opinion on data source — works with any backend

### What This Library Does NOT Do
- No data fetching — you provide the data, it renders
- No CRUD operations — it's a visualization component, not a data manager
- No opinions on backend or storage
- No built-in forms or modals

---

## TECH STACK

| Dependency | Why |
|-----------|-----|
| react-native-svg | SVG rendering on all platforms |
| react-native-gesture-handler | Pan, pinch gestures |
| react-native-reanimated | Smooth animated zoom/pan |

Peer dependencies (user must install):
- react
- react-native
- react-native-svg
- react-native-gesture-handler
- react-native-reanimated

Dev dependencies:
- vitest (testing)
- @testing-library/react-native
- typescript (type definitions)
- tsup (bundling)

---

## API DESIGN

### Basic Usage

```jsx
import { FamilyTree } from '@kintales/tree-view';

const people = [
  { id: '1', name: 'Grandpa Ivan', gender: 'male', photo: 'https://...', birthYear: 1940, deathYear: 2020 },
  { id: '2', name: 'Grandma Maria', gender: 'female', photo: 'https://...', birthYear: 1943 },
  { id: '3', name: 'Father Petar', gender: 'male', birthYear: 1965 },
  { id: '4', name: 'Mother Elena', gender: 'female', birthYear: 1968 },
  { id: '5', name: 'Me', gender: 'male', birthYear: 1992 },
];

const relationships = [
  { from: '1', to: '2', type: 'spouse' },
  { from: '1', to: '3', type: 'parent' },  // Ivan is parent of Petar
  { from: '2', to: '3', type: 'parent' },  // Maria is parent of Petar
  { from: '3', to: '4', type: 'spouse' },
  { from: '3', to: '5', type: 'parent' },
  { from: '4', to: '5', type: 'parent' },
];

<FamilyTree
  people={people}
  relationships={relationships}
  onPersonTap={(person) => console.log('Tapped:', person.name)}
  rootId="1"  // Who to center the tree on
/>
```

### Props

```typescript
interface Person {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';  // Optional, only for layout hints
  photo?: string;          // URL or local URI
  birthYear?: number;
  deathYear?: number;      // If set, person is deceased
  [key: string]: any;      // Any custom data
}

interface Relationship {
  from: string;   // Person ID
  to: string;     // Person ID
  type: string;
    // 'parent' | 'spouse' | 'sibling' | 'step_parent' | 'step_child' |
    // 'step_sibling' | 'adopted' | 'guardian'
    // ALL rendered identically — same line style, same thickness, same color
    // The type is metadata only, NOT visual differentiation
  marriageYear?: number;   // For spouse type
  divorceYear?: number;
}

interface FamilyTreeProps {
  people: Person[];
  relationships: Relationship[];
  rootId?: string;                    // Center tree on this person
  onPersonTap?: (person: Person) => void;
  onPersonLongPress?: (person: Person) => void;

  // Layout
  nodeWidth?: number;                 // Default: 120
  nodeHeight?: number;                // Default: 160
  horizontalSpacing?: number;         // Default: 40
  verticalSpacing?: number;           // Default: 80

  // Appearance
  theme?: 'warm' | 'neutral' | 'custom';  // Default: 'warm'
  customTheme?: TreeTheme;
  showPhotos?: boolean;               // Default: true
  showDates?: boolean;                // Default: true
  photoShape?: 'circle' | 'rounded';  // Default: 'circle'
  deceasedStyle?: 'dim' | 'sepia' | 'none';  // Default: 'none' (equal treatment)

  // Gestures
  enablePan?: boolean;                // Default: true
  enableZoom?: boolean;               // Default: true
  minZoom?: number;                   // Default: 0.3
  maxZoom?: number;                   // Default: 3.0
  initialZoom?: number;               // Default: 1.0

  // Advanced
  renderNode?: (person: Person, position: NodePosition) => React.ReactNode;  // Custom node renderer
  renderEdge?: (from: Person, to: Person, type: string) => React.ReactNode;  // Custom edge renderer
}

interface TreeTheme {
  backgroundColor: string;
  nodeBackgroundColor: string;
  nodeBorderColor: string;
  nodeTextColor: string;
  edgeColor: string;
  edgeWidth: number;
  fontFamily: string;
  fontSize: number;
  photoPlaceholderColor: string;      // Background for initials when no photo
}
```

### Built-in Themes

```javascript
// 'warm' theme (default) — earth tones, amber, cream
const warmTheme = {
  backgroundColor: '#FFF8F0',
  nodeBackgroundColor: '#FFFAF5',
  nodeBorderColor: '#D4A574',
  nodeTextColor: '#4A3728',
  edgeColor: '#C4956A',
  edgeWidth: 2,
  fontFamily: 'System',
  fontSize: 13,
  photoPlaceholderColor: '#E8D5C0',
};

// 'neutral' theme — clean, modern
const neutralTheme = {
  backgroundColor: '#FAFAFA',
  nodeBackgroundColor: '#FFFFFF',
  nodeBorderColor: '#E0E0E0',
  nodeTextColor: '#333333',
  edgeColor: '#BDBDBD',
  edgeWidth: 1.5,
  fontFamily: 'System',
  fontSize: 13,
  photoPlaceholderColor: '#F0F0F0',
};
```

---

## CRITICAL DESIGN RULES

1. **ALL relationship types have IDENTICAL visual style.** No different colors, line styles, dashes, or thickness for step-parents vs biological parents. The `type` field is metadata for the consumer's use — the tree does not differentiate visually.

2. **No built-in "male = blue, female = pink" coloring.** Gender is optional and used only for layout hinting (placing spouses side by side). If the consumer wants gendered colors, they can use `renderNode` to customize.

3. **No special treatment for deceased people by default.** `deceasedStyle: 'none'` is the default. If consumer wants dimming, they opt in.

4. **No assumptions about family structure.** A person can have 0, 1, or many spouses. A person can have 0 or many parents. A person can be linked as both parent and child in the graph. The layout algorithm handles all cases without crashing.

5. **Performance first.** Trees with 100+ nodes must render smoothly. Use viewport culling (don't render nodes outside visible area), lazy image loading, and memoization.

---

## PROJECT STRUCTURE

```
kintales-tree-view/
├── src/
│   ├── index.ts                   # Public API exports
│   ├── FamilyTree.tsx             # Main component
│   ├── components/
│   │   ├── TreeCanvas.tsx         # SVG canvas with gesture handling
│   │   ├── TreeNode.tsx           # Individual person node
│   │   ├── TreeEdge.tsx           # Line between nodes
│   │   ├── PhotoNode.tsx          # Circular photo with fallback to initials
│   │   └── DateLabel.tsx          # "1940 — 2020" label
│   ├── layout/
│   │   ├── familyLayout.ts        # Main layout algorithm
│   │   ├── graphBuilder.ts        # Convert people+relationships to graph
│   │   ├── positioner.ts          # Calculate X/Y positions
│   │   ├── spouseLayout.ts        # Place spouses side by side
│   │   ├── multiMarriageLayout.ts # Handle person with multiple spouses
│   │   └── types.ts               # Layout types
│   ├── gestures/
│   │   ├── usePanZoom.ts          # Pan + zoom hook (reanimated)
│   │   └── useTapGesture.ts       # Tap on node hook
│   ├── themes/
│   │   ├── warm.ts
│   │   ├── neutral.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── viewportCulling.ts     # Only render visible nodes
│   │   ├── initials.ts            # Extract initials from name
│   │   └── dateFormat.ts          # Format birth/death years
│   └── types.ts                   # Public types (Person, Relationship, etc.)
├── __tests__/
│   ├── layout/
│   │   ├── familyLayout.test.ts   # Layout algorithm tests
│   │   ├── multiMarriage.test.ts  # Multiple marriages layout
│   │   └── edgeCases.test.ts      # Empty tree, single person, cycles
│   ├── components/
│   │   ├── FamilyTree.test.tsx    # Component rendering tests
│   │   └── TreeNode.test.tsx
│   └── gestures/
│       └── usePanZoom.test.ts
├── examples/
│   ├── BasicTree.tsx              # Minimal example
│   ├── ComplexTree.tsx            # Multiple marriages, step-children, 20+ people
│   ├── LargeTree.tsx             # 100+ nodes performance demo
│   ├── CustomTheme.tsx           # Custom colors and fonts
│   └── CustomNodes.tsx           # Custom renderNode example
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── layout-algorithm.md
│   ├── performance.md
│   └── customization.md
├── package.json
├── tsconfig.json
├── tsup.config.ts                 # Bundler config
├── LICENSE                        # MIT
├── CHANGELOG.md
├── CLAUDE.md
└── README.md                     # npm README with badges, examples, screenshots
```

---

## LAYOUT ALGORITHM

The layout algorithm is the hardest part. High-level approach:

1. **Build graph**: Convert `people[]` + `relationships[]` into a directed acyclic graph (DAG). Handle cycles (e.g., consanguinity) by breaking them at a chosen edge.

2. **Assign generations**: BFS from root → each person gets a generation number (0 = root, 1 = children, -1 = parents).

3. **Group by generation**: Each generation is a horizontal row.

4. **Position spouses**: Spouses are placed side by side at the same generation level, connected by a horizontal line.

5. **Position children**: Children are centered below their parents' midpoint.

6. **Handle multiple marriages**: Person A married to B and C → B is on one side, C on the other. Children of each marriage grouped under the respective spouse pair.

7. **Minimize edge crossings**: Reorder siblings to reduce crossing lines (heuristic, not perfect).

8. **Compute coordinates**: Each node gets (x, y) in abstract units → multiply by (nodeWidth + horizontalSpacing, nodeHeight + verticalSpacing) for pixel positions.

Edge cases:
- Single person (no relationships) → centered, single node
- Person with no parents in tree → starts a new branch at top
- Person with 3+ spouses → spouses arranged horizontally
- Half-siblings → shared parent connects to both marriage groups
- Adoptive relationships → treated identically to biological

---

## DEVELOPMENT PHASES

### v0.1 — Static Tree (2-3 weeks)
```
/plan "Build the core FamilyTree component with static rendering. Implement: 1) GraphBuilder that converts people+relationships to internal graph representation, 2) FamilyLayout algorithm that assigns (x,y) positions — handle: single person, parent-child, spouses, multiple generations, 3) TreeCanvas using react-native-svg Svg component, 4) TreeNode showing name + initials circle (no photos yet) + optional date label, 5) TreeEdge drawing lines between nodes (all same style). Test with: empty tree, 1 person, nuclear family (2 parents + 2 kids), 3 generations. TDD for layout algorithm."
```
```
/tdd
/code-review
```
```bash
git commit -m "feat: v0.1 static tree rendering with layout algorithm"
```

### v0.2 — Gestures (1-2 weeks)
```
/plan "Add gesture support to FamilyTree. 1) Pan: drag to move the tree (react-native-gesture-handler PanGesture + react-native-reanimated shared value for translateX/Y), 2) Zoom: pinch to zoom (PinchGesture + scale shared value), 3) Double-tap to reset zoom, 4) Tap on node: fires onPersonTap callback with person data, 5) Clamp zoom to minZoom/maxZoom, 6) Smooth animations on all gestures. Test on iOS simulator + Android emulator."
```
```
/code-review
```
```bash
git commit -m "feat: v0.2 pan, zoom, pinch, tap gestures"
```

### v0.3 — Photos & Multiple Marriages (1-2 weeks)
```
/plan "Enhance tree nodes and layout. 1) PhotoNode: circular photo from URL (react-native-svg Image + ClipPath for circle), fallback to initials on warm background, 2) Multiple marriage layout: person with 2+ spouses → each spouse positioned on alternating sides, children grouped per marriage, 3) Deceased indicator: optional sepia/dim style (off by default), 4) Theme support: 'warm' and 'neutral' built-in themes + customTheme prop. Test with: person with 3 spouses, step-children, half-siblings, 20+ person tree."
```
```
/code-review
```
```bash
git commit -m "feat: v0.3 photos, multiple marriages, themes"
```

### v1.0 — Performance & Publish (1 week)
```
/plan "Optimize for production and publish. 1) Viewport culling: only render nodes within the visible area (check node bounds against viewport bounds in onLayout), 2) Memoization: React.memo on TreeNode and TreeEdge, useMemo on layout computation, 3) Lazy image loading: load photos only when node is in viewport, 4) Test with 100+ node tree — must maintain 60fps scroll, 5) TypeScript declarations, 6) tsup bundle for CommonJS + ESM, 7) README with badges, installation, usage examples, screenshots, API reference, 8) CHANGELOG, 9) npm publish as @kintales/tree-view. Test on physical iOS device + physical Android device."
```
```
/code-review
```
```bash
git commit -m "feat: v1.0 performance optimization and npm publish"
npm publish
```

---

## TESTING STRATEGY

- **Layout algorithm**: Pure function tests with vitest. Input: people+relationships → Output: positions. Test all edge cases.
- **Components**: @testing-library/react-native. Verify nodes render, tap fires callback, photos display.
- **Gestures**: Manual testing on iOS + Android devices. Automated gesture tests are unreliable.
- **Performance**: Benchmark with 50, 100, 200 node trees. Measure: initial render time, scroll FPS, memory usage.

---

## GIT & NPM

```bash
git commit -m "type: description"
```

Semantic versioning: MAJOR.MINOR.PATCH
- PATCH: bug fixes
- MINOR: new features, backward compatible
- MAJOR: breaking API changes

npm package name: `@kintales/tree-view`
License: MIT
