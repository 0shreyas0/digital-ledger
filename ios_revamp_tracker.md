# iOS UI Revamp Tracker

Tracks which iOS components currently have Android-style fallback UI and what
the target iOS 26 / SwiftUI experience should look like.

**Platform file convention:** `ComponentName.ios.jsx` = iOS-only, `ComponentName.android.jsx` = Android-only

---

## Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Done
- `[-]` Intentionally skipped / not needed

---

## Pressables

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `BluePressable` | `BluePressable.ios.jsx` | SwiftUI `Button(style: .glass)` circle | ✅ Native glass — no change needed | `[x]` |
| `CirclePressable` | `CirclePressable.ios.jsx` | SwiftUI `Button(style: .glass)` circle | ✅ Native glass — no change needed | `[x]` |
| `AppPressable` | `AppPressable.jsx` (cross-platform) | RN `Pressable` with accent bg | Evaluate SwiftUI `Button(style: .plain)` wrap | `[ ]` |
| `WidePressable` | `WidePressable.jsx` | Not implemented | Full-width SwiftUI glass pill | `[ ]` |
| `CategoryPressable` | Not implemented | — | — | `[ ]` |
| `TypePressable` | Not implemented | — | — | `[ ]` |

---

## Filter & Search

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `ActivityFilterChips` | `ActivityFilterChips.ios.jsx` | SwiftUI `GlassEffectContainer` chip row | ✅ Glass chips with primary tint for active | `[x]` |
| `SearchBar` | `SearchBar.ios.jsx` | SwiftUI `glassEffect` capsule + RN `TextInput` | ✅ Matches tab bar glass material | `[x]` |
| `TransactionFilter` (trigger) | `TransactionFilter.ios.jsx` | SwiftUI `Button(.glass / .borderedProminent)` | ✅ Done | `[x]` |
| `TransactionFilter` (modal body) | `TransactionFilter.ios.jsx` | ~~react-native-modal~~ → `NativeBottomSheet` | ✅ Migrated to native iOS SwiftUI sheet | `[x]` |

---

## Modals & Sheets

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `NativeBottomSheet` | `NativeBottomSheet.ios.jsx` | `@expo/ui/community/bottom-sheet` SwiftUI sheet | ✅ Native sheet, near-clear glass bg | `[x]` |
| `CategorySelectModal` | Uses `NativeBottomSheet` | Inherits native sheet | ✅ No additional work needed | `[x]` |
| `DateSelectModal` | Uses `NativeBottomSheet` | Inherits native sheet | ✅ No additional work needed | `[x]` |
| `MonthPickerModal` | Uses `NativeBottomSheet` | Inherits native sheet | ✅ No additional work needed | `[x]` |
| `WeekPickerModal` | Uses `NativeBottomSheet` | Inherits native sheet | ✅ No additional work needed | `[x]` |

---

## Input Fields

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `PasswordInput` | `PasswordInput.ios.jsx` | RN `TextInput`, System font | ✅ System font, no Android hacks | `[x]` |
| `FieldInputBox` | `FieldInputBox.jsx` (cross-platform) | Standard border input | Reverted to cross-platform standard RN | `[-]` |
| `OTPInput` | `OTPInput.jsx` (cross-platform) | Plain RN `TextInput` | Custom iOS 26 glass OTP box | `[ ]` |

---

## Cards & Lists

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `BalanceCard` | `BalanceCard.jsx` (cross-platform) | Standard shadow card | Reverted to cross-platform standard RN | `[-]` |
| `TransactionItem` | `.jsx` (cross-platform) | RN card | Swipe actions via SwiftUI `swipeActions` | `[ ]` |
| `CategoryItem` | `.jsx` (cross-platform) | RN row card | Swipe-to-delete via SwiftUI | `[ ]` |
| `NoTransactionFound` | `.jsx` (cross-platform) | RN card with CTA | Glass card treatment | `[ ]` |

---

## Navigation

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `NestedTopBar` | `.jsx` → uses `CirclePressable.ios.jsx` | Already glass back button | ✅ No change needed | `[x]` |
| `SafeScreen` | `.jsx` (cross-platform) | RN safe area view | ✅ No change needed | `[-]` |

---

## Analytics

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `Graph` | `analytics/Graph.jsx` | SVG-based line chart | ✅ SVG is platform-agnostic | `[-]` |

---

## Auth

| Component | iOS File | Current iOS UI | Target iOS UI | Status |
|---|---|---|---|---|
| `SignOutButton` | `.jsx` → `CirclePressable.ios.jsx` | Already glass via `CirclePressable` | ✅ No change needed | `[x]` |
| `ErrorBanner` | `.tsx` (cross-platform) | Reanimated animated banner | ✅ Animation is platform-agnostic | `[-]` |

---

## Priority Backlog (Remaining)

1. **`OTPInput`** — iOS 26 glass OTP boxes
2. **`TransactionItem`** — swipe-to-delete / swipe actions
3. **`CategoryItem`** — swipe-to-delete
4. **`NoTransactionFound`** — glass card treatment
5. **`AppPressable`** — evaluate SwiftUI wrapping
