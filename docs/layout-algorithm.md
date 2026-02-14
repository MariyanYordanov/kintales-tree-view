# Layout Algorithm

The layout algorithm converts `people[]` + `relationships[]` into positioned nodes and edges. It is implemented as a pure function (`computeLayout`) with no React dependency.

## Pipeline

### 1. Build graph (`graphBuilder.ts`)

Converts the flat arrays into an adjacency graph `Map<string, GraphNode>`:

```
GraphNode {
  person: Person
  parents: string[]    // IDs of parents
  children: string[]   // IDs of children
  spouses: string[]    // IDs of spouses
  generation: number   // Assigned in step 2
}
```

Relationship type mapping:
- `parent`, `step_parent`, `adopted`, `guardian` → from.children += to, to.parents += from
- `spouse` → bidirectional spouses link
- `step_child` → reverse of parent (to.children += from)
- `sibling`, `step_sibling` → no explicit edge (positioned via shared parents)
- Unknown types → treated as parent→child

### 2. Assign generations (`assignGenerations`)

BFS from a root node assigns generation numbers:
- Root = generation 0
- Children = generation + 1
- Parents = generation - 1
- Spouses = same generation

Root selection priority:
1. Provided `rootId`
2. First person with no parents
3. First person in the array

Disconnected components get a separate BFS pass from generation 0.

### 3. Group by generation (`groupByGeneration`)

Groups all nodes into horizontal rows by generation number.

### 4. Position nodes (`positioner.ts`)

#### Spouse layout (`spouseLayout.ts`)

Groups same-generation spouses into **family units**:

```
FamilyUnit {
  members: string[]    // All spouse IDs
  children: string[]   // All children of any member pair
}
```

#### Multi-marriage layout (`multiMarriageLayout.ts`)

For persons with 2+ spouses, children are sub-grouped per spouse pair:

```
MultiMarriageGroup {
  personId: string
  spouseGroups: Array<{
    spouseId: string
    childIds: string[]
  }>
}
```

#### Coordinate calculation

1. Each generation row is laid out left-to-right
2. Family units are placed as groups (spouses side by side)
3. Children are centered below their parent pair's midpoint
4. A second pass re-centers children per spouse pair for multi-marriage cases

Coordinates: `x = slot * (nodeWidth + horizontalSpacing)`, `y = generation * (nodeHeight + verticalSpacing)`

### 5. Build edges

Two types of edges:
- **Spouse edges**: horizontal line between spouse pair centers
- **Parent→child edges**: L-shaped path (vertical from parent, horizontal to child column, vertical down to child)

All edges use identical visual style regardless of relationship type.

## Edge cases

| Case | Handling |
|------|----------|
| Empty tree | Returns `{ nodes: [], edges: [], width: 0, height: 0 }` |
| Single person | Centered at origin, no edges |
| No relationships | Each person at generation 0, side by side |
| 3+ spouses | Arranged horizontally in the same row |
| Half-siblings | Shared parent links to multiple spouse groups |
| Disconnected groups | Separate BFS pass, placed at generation 0 |
| Missing person ref | Skipped silently (no crash) |
| Duplicate relationships | Deduplicated via `includes()` check |

## Performance

The algorithm runs in O(n + e) time where n = people count and e = relationship count:
- Graph building: O(n + e)
- BFS generation assignment: O(n + e)
- Positioning: O(n)
- Edge building: O(e)

Tested with 200+ nodes completing in under 2 seconds.
