# iOS 26 Glass UI — Patterns & Gotchas

This file documents hard-won discoveries about `@expo/ui/swift-ui` glass effects
so they are never re-learned from scratch. Read this before writing ANY new
`.ios.jsx` glass component.

---

## The Only Working Pattern for `Host` + `glassEffect`

Copy this EXACTLY. Every deviation has been tested and broken.

```jsx
import { StyleSheet } from 'react-native';
import { Host, HStack, Spacer } from '@expo/ui/swift-ui';
import { glassEffect, frame } from '@expo/ui/swift-ui/modifiers';

// Inside JSX:
<View style={styles.container}>             {/* 1. RN outer container */}
  <Host style={StyleSheet.absoluteFill} pointerEvents="none">
    <HStack
      modifiers={[
        frame({ minWidth: 0, maxWidth: 999999, minHeight: 0, maxHeight: 999999 }),
        glassEffect({
          glass: { variant: 'regular', interactive: true },
          shape: 'roundedRectangle',     // or 'capsule' / 'rectangle'
          cornerRadius: 16,              // only for roundedRectangle
        }),
      ]}
    >
      <Spacer />
    </HStack>
  </Host>
  <View style={styles.content}>{children}</View>   {/* 2. RN content on top */}
</View>

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,  // mirrors cornerRadius for RN clipping
    // ⚠️ NO overflow: 'hidden' — see rules below
  },
});
```

---

## Rules (Violation = Invisible Glass)

### ❌ Rule 1: NEVER add `overflow: 'hidden'` to the wrapper View
`overflow: 'hidden'` clips the SwiftUI `Host` rendering entirely.
The glass layer becomes invisible even though the RN content still shows.
Use `borderRadius` for corner rounding — it does NOT clip the Host.

### ❌ Rule 2: NEVER use a separate `cornerRadius` modifier
There is NO `cornerRadius(n)` standalone export from `@expo/ui/swift-ui/modifiers`
(it exists but it applies to SwiftUI children, not to the glass shape).
Corner radius for the glass shape goes INSIDE `glassEffect`:
```js
// ❌ WRONG
import { cornerRadius } from '@expo/ui/swift-ui/modifiers';
cornerRadius(16)  // does NOT round the glass shape

// ✅ CORRECT
glassEffect({ shape: 'roundedRectangle', cornerRadius: 16 })
```

### ❌ Rule 3: NEVER set `interactive: false`
`interactive: false` renders no visible glass material on iOS 26.
Always use `interactive: true`, even for purely decorative containers.

### ❌ Rule 4: NEVER apply `opacity()` modifier to the Host/HStack
The `opacity()` modifier fades the ENTIRE Host layer, including RN children
rendered on top. Glass transparency is controlled by the system glass material,
not by opacity.

### ✅ Rule 5: `frame` MUST span full dimensions
Without the frame modifier, the HStack collapses to zero size:
```js
frame({ minWidth: 0, maxWidth: 999999, minHeight: 0, maxHeight: 999999 })
```

---

## Valid `glassEffect` Shape Values

| `shape` value | SwiftUI equivalent | Notes |
|---|---|---|
| `'capsule'` | `Capsule()` | Fully rounded ends. Use for pills, search bars, chips. |
| `'roundedRectangle'` | `RoundedRectangle(cornerRadius:)` | Requires `cornerRadius` param. Use for cards, inputs. |
| `'rectangle'` | `Rectangle()` | No rounding. Rarely useful. |
| `'circle'` | `Circle()` | Perfectly circular — only if view is square. |
| `'ellipse'` | `Ellipse()` | Oval. |
| `'containerRelativeShape'` | `ContainerRelativeShape()` | Adapts to parent container shape. |

Source: `node_modules/@expo/ui/build/swift-ui/modifiers/index.d.ts`, line 662.

---

## Alternative: `buttonStyle('glass')` for Buttons

For interactive button-shaped glass, use SwiftUI's native button style instead
of the Host/HStack pattern. This is what `BluePressable.ios.jsx` and
`CirclePressable.ios.jsx` use:

```jsx
import { Host, Button } from '@expo/ui/swift-ui';
import { buttonStyle, buttonBorderShape, controlSize, labelStyle } from '@expo/ui/swift-ui/modifiers';

<Host matchContents>
  <Button
    label="Action"
    onPress={handler}
    modifiers={[
      buttonStyle('glass'),          // or 'borderedProminent' when active
      buttonBorderShape('capsule'),  // or 'circle', 'roundedRectangle'
      controlSize('large'),
      labelStyle('iconOnly'),
    ]}
  />
</Host>
```

---

## Alternative: `GlassEffectContainer` for Grouped Chips

For a row of chips that merge into one connected glass body
(like `ActivityFilterChips.ios.jsx`):

```jsx
import { Host, GlassEffectContainer, HStack, Button } from '@expo/ui/swift-ui';

<Host matchContents>
  <GlassEffectContainer spacing={10}>
    <HStack spacing={10}>
      {items.map(item => (
        <Button
          key={item.value}
          label={item.label}
          onPress={() => onPress(item.value)}
          modifiers={[
            buttonStyle('plain'),
            buttonBorderShape('capsule'),
            glassEffect({ glass: { variant: 'regular', interactive: true, tint: isActive ? '#007AFF' : undefined }, shape: 'capsule' }),
          ]}
        />
      ))}
    </HStack>
  </GlassEffectContainer>
</Host>
```

---

## Component Reference

| Component | Glass Pattern Used | File |
|---|---|---|
| `BluePressable` | `buttonStyle('glass')` | `pressables/BluePressable.ios.jsx` |
| `CirclePressable` | `buttonStyle('glass')` | `pressables/CirclePressable.ios.jsx` |
| `SearchBar` | `Host + HStack + glassEffect({ shape: 'capsule' })` | `SearchBar.ios.jsx` |
| `ActivityFilterChips` | `GlassEffectContainer + Button + glassEffect` | `ActivityFilterChips.ios.jsx` |
| `TransactionFilter` | `buttonStyle('glass'/'borderedProminent')` | `TransactionFilter.ios.jsx` |
| `BalanceCard` | None (Reverted to standard RN) | `BalanceCard.jsx` |
| `FieldInputBox` | None (Reverted to standard RN) | `FieldInputBox.jsx` |

