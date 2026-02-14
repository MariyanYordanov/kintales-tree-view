# Getting Started

## Installation

```bash
npm install @kintales/tree-view
```

Install peer dependencies:

```bash
npm install react-native-svg react-native-gesture-handler react-native-reanimated
```

Follow the setup guides for each library:
- [react-native-svg](https://github.com/software-mansion/react-native-svg#installation)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)

## Minimal example

```jsx
import { FamilyTree } from '@kintales/tree-view';

const people = [
  { id: '1', name: 'Parent', birthYear: 1960 },
  { id: '2', name: 'Spouse', birthYear: 1962 },
  { id: '3', name: 'Child', birthYear: 1990 },
];

const relationships = [
  { from: '1', to: '2', type: 'spouse' },
  { from: '1', to: '3', type: 'parent' },
  { from: '2', to: '3', type: 'parent' },
];

export default function App() {
  return (
    <FamilyTree
      people={people}
      relationships={relationships}
      rootId="1"
      onPersonTap={(person) => console.log(person.name)}
    />
  );
}
```

## Data model

### Person

Each person needs at minimum an `id` and `name`. All other fields are optional:

```typescript
{
  id: string;        // Unique identifier
  name: string;      // Display name
  gender?: 'male' | 'female' | 'other';  // Layout hint only
  photo?: string;    // URL or local URI
  birthYear?: number;
  deathYear?: number;
}
```

### Relationship

Relationships connect two people by their IDs:

```typescript
{
  from: string;  // Person ID
  to: string;    // Person ID
  type: 'parent' | 'spouse' | 'sibling' | 'step_parent'
      | 'step_child' | 'step_sibling' | 'adopted' | 'guardian';
}
```

- `parent`: "from" is parent of "to"
- `spouse`: bidirectional marriage link
- `step_child`: "from" is step-child of "to" (reverse of step_parent)
- All types are rendered with identical visual style

## Next steps

- [API Reference](./api-reference.md) — Full props and types documentation
- [Customization](./customization.md) — Themes and custom renderers
- [Performance](./performance.md) — Optimization for large trees
- [Layout Algorithm](./layout-algorithm.md) — How the tree is positioned
