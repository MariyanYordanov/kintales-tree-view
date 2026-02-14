# Customization

## Themes

### Built-in themes

Two themes are included:

**`warm`** (default) — Earth tones, amber, cream:
```javascript
{
  backgroundColor: '#FFF8F0',
  nodeBackgroundColor: '#FFFAF5',
  nodeBorderColor: '#D4A574',
  nodeTextColor: '#4A3728',
  edgeColor: '#C4956A',
  edgeWidth: 2,
  fontFamily: 'System',
  fontSize: 13,
  photoPlaceholderColor: '#E8D5C0',
}
```

**`neutral`** — Clean, modern:
```javascript
{
  backgroundColor: '#FAFAFA',
  nodeBackgroundColor: '#FFFFFF',
  nodeBorderColor: '#E0E0E0',
  nodeTextColor: '#333333',
  edgeColor: '#BDBDBD',
  edgeWidth: 1.5,
  fontFamily: 'System',
  fontSize: 13,
  photoPlaceholderColor: '#F0F0F0',
}
```

### Custom theme

Pass `theme="custom"` with a `customTheme` object:

```jsx
const darkTheme = {
  backgroundColor: '#1a1a2e',
  nodeBackgroundColor: '#16213e',
  nodeBorderColor: '#0f3460',
  nodeTextColor: '#e0e0e0',
  edgeColor: '#0f3460',
  edgeWidth: 2,
  fontFamily: 'System',
  fontSize: 13,
  photoPlaceholderColor: '#1a1a40',
};

<FamilyTree
  theme="custom"
  customTheme={darkTheme}
  // ...
/>
```

All 9 `TreeTheme` fields are required for a custom theme.

## Custom node renderer

Replace the default node rendering with `renderNode`:

```jsx
import { Circle, Text } from 'react-native-svg';

<FamilyTree
  renderNode={(person, position) => (
    <>
      <Circle
        cx={position.x + position.width / 2}
        cy={position.y + position.height / 2}
        r={40}
        fill={person.gender === 'female' ? '#E8A0BF' : '#7286D3'}
      />
      <Text
        x={position.x + position.width / 2}
        y={position.y + position.height / 2 + 5}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
      >
        {person.name}
      </Text>
    </>
  )}
/>
```

The `position` object provides `{ x, y, width, height }` in SVG coordinates.

If `renderNode` returns `null` or `undefined`, the default node rendering is used as fallback.

## Custom edge renderer

Replace the default edge rendering with `renderEdge`:

```jsx
import { Line } from 'react-native-svg';

<FamilyTree
  renderEdge={(from, to, type) => (
    <Line
      x1={/* compute from positions */}
      y1={/* ... */}
      x2={/* ... */}
      y2={/* ... */}
      stroke={type === 'spouse' ? 'red' : 'blue'}
      strokeWidth={2}
    />
  )}
/>
```

## Deceased styles

Three options via `deceasedStyle`:

- `'none'` (default) — No visual difference for deceased people
- `'dim'` — Reduces opacity to 0.6
- `'sepia'` — Applies warm brownish tint (background, border, text colors)

```jsx
<FamilyTree deceasedStyle="sepia" />
```

## Photo options

- `showPhotos={true}` (default) — Shows circular photo or initials fallback
- `showPhotos={false}` — Hides the photo area entirely
- `photoShape="circle"` (default) — Circular photos
- `photoShape="rounded"` — Rounded rectangle photos

## Layout sizing

Adjust node dimensions and spacing:

```jsx
<FamilyTree
  nodeWidth={150}      // Wider nodes
  nodeHeight={200}     // Taller nodes
  horizontalSpacing={60}  // More horizontal space
  verticalSpacing={100}   // More vertical space
/>
```
