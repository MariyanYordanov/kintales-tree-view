# Performance

## Viewport culling

Trees with 50+ nodes automatically enable viewport culling. Only nodes within the visible area (plus a 200px margin) are rendered as React elements.

### How it works

1. `onLayout` captures the container dimensions
2. `useAnimatedReaction` watches pan/zoom shared values (grid-snapped to 50px to reduce updates)
3. Visible bounds are computed in tree-space coordinates
4. `useMemo` filters `layout.nodes` and `layout.edges` to only visible ones
5. Edges are included if either endpoint node is visible

### Configuration

Culling is automatic — no configuration needed:
- **Threshold**: 50 nodes (trees below this render all nodes)
- **Margin**: 200px (prevents nodes popping in at edges)
- **Update grid**: 50px (reduces re-render frequency during animations)

## Memoization

All SVG components use `React.memo` to prevent unnecessary re-renders:
- `TreeCanvas` — outer container
- `TreeNode` — individual person node
- `TreeEdge` — connection line
- `PhotoNode` — photo/initials circle
- `DateLabel` — birth/death label

Layout computation uses `useMemo` with dependency tracking:
- `computeLayout` recalculates only when `people`, `relationships`, `rootId`, or spacing changes
- Theme resolution recalculates only when `themeName` or `customTheme` changes
- Node and edge render lists recalculate only when their inputs change

## Benchmarks

Layout computation benchmarks (measured in tests):

| Tree size | Time |
|-----------|------|
| 50 nodes | < 50ms |
| 100 nodes | < 500ms |
| 150 nodes | < 1000ms |
| 200 nodes | < 2000ms |

## Tips for large trees

1. Set `showPhotos={false}` to avoid image loading overhead
2. Set `showDates={false}` to reduce SVG element count
3. Use `initialZoom` < 1.0 to show more of the tree initially
4. The `computeLayout` function can be called outside React for pre-computation
