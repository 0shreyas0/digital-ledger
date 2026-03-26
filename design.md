# Design System Notes

This document captures the visual and stylistic choices currently implemented in the mobile app so the design language is transferable across future contributors, platforms, and refactors.

## Overall Direction

The app uses a clean, modern personal-finance aesthetic built around:

- Calm blue surfaces instead of flat white screens
- Rounded cards and pill-shaped actions for a soft, approachable feel
- Google Sans typography for a friendlier product voice
- Bright lime accent feedback to create moments of energy on interaction
- Light, airy layouts with strong spacing and minimal visual clutter

The current design reads as "financial, trustworthy, modern, slightly playful" rather than corporate, luxury, or hyper-minimal.

## Color System

The active color tokens are defined in [global.css](/Users/shreyas/Code/react native expo/expense-app/mobile/global.css) and mirrored in [constants/colors.js](/Users/shreyas/Code/react native expo/expense-app/mobile/constants/colors.js).

### Light Theme

- Primary: `#5B8CF5` in CSS, with a closely related JS token `#2563EB`
- Secondary: `#7789AE` in CSS, with a brighter JS token `#06B6D4`
- Background: `#E3F2FD`
- Accent: `#AEEA00`
- Border: `#1E293B`
- Danger: `#EF4444`
- Danger surface: `#FFB3A6` in CSS, `#FF6347` in JS
- Success: `#22C55E` in JS component usage

### Dark Theme

- Primary: `#18467D` in CSS, with a lighter JS token `#60A5FA`
- Secondary: `#22D3EE`
- Background: `#020817`
- Accent: `#AEEA00`
- Border: `#1E293B`
- Danger: `#7E1E1D`
- Danger surface: `#EF4444`

### Practical Color Intent

- Blue is the brand anchor and primary action color.
- Very light blue backgrounds keep the app from feeling sterile.
- Lime green is reserved for interaction energy and pressed states, not large surfaces.
- Red is used conventionally for errors and expense signaling.
- Slate neutrals are frequently used directly through Tailwind utility classes for text, borders, and surfaces.

## Typography

Typography is configured in [app/_layout.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/app/_layout.jsx) and [tailwind.config.js](/Users/shreyas/Code/react native expo/expense-app/mobile/tailwind.config.js).

### Font Family

- `GoogleSans-Regular`
- `GoogleSans-Medium`
- `GoogleSans-Bold`

### Tailwind Font Tokens

- `font-sansReg`
- `font-sansMed`
- `font-sansBold`

### Typographic Voice

- Headlines use bold Google Sans and tend to feel friendly rather than formal.
- Body copy uses regular or medium weights with generous padding and readable line length.
- Buttons often use bold type at larger-than-average sizes, which gives the interface confidence and warmth.

### Common Type Sizes in Use

- Hero/auth titles: `text-3xl`
- Primary CTA labels: `text-2xl` or `text-xl`
- Section labels and balance labels: `text-lg`
- Body and input text: around `16px`
- Supportive helper text: `14px`
- Small metadata: `12px`

## Layout Philosophy

The app favors simple vertical stacking with clear breathing room.

- Screen shells often use `mx-4` or `m-6` style spacing
- Content is centered on auth flows for a welcoming onboarding feel
- Protected content uses cards and grouped sections instead of dense lists
- Spacing is generous and rounded corners are used almost everywhere

This gives the product a consumer-app personality rather than an enterprise dashboard feel.

## Shape Language

Rounded geometry is a major part of the visual identity.

- Inputs: usually `rounded-2xl`
- Major CTAs: usually `rounded-full`
- Cards: usually `rounded-2xl`
- Small action buttons and chips: rounded pills or circles

The result is soft and approachable. Hard corners are largely avoided.

## Surface Treatment

Visual depth is subtle but present.

- Cards commonly use pale surfaces like `bg-slate-50`
- Shadows are light: `shadow-sm` in utility classes or low-opacity shadow styles in StyleSheet files
- Borders are often slate-based rather than pure gray
- Main background is tinted blue instead of plain white

The app aims for softness and separation without dramatic elevation.

## Interaction Language

Press states are intentionally energetic.

- Primary pressables often use blue by default
- Pressed state frequently switches to the lime accent
- Pressed icon/text color tends to flip toward dark slate for strong contrast

This makes actions feel lively and tactile, especially in:

- [components/pressables/BluePressable.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/pressables/BluePressable.jsx)
- [components/pressables/WidePressable.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/pressables/WidePressable.jsx)
- [components/pressables/CirclePressable.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/pressables/CirclePressable.jsx)
- [components/NoTransactionFound.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/NoTransactionFound.jsx)

## Auth Flow Styling

The auth screens establish the clearest expression of the brand.

Observed in:

- [app/(auth)/sign-in.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/app/(auth)/sign-in.jsx)
- [app/(auth)/sign-up.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/app/(auth)/sign-up.jsx)

Key choices:

- Large finance-themed illustration at the top
- Blue headline for welcome and account creation moments
- Light background with centered vertical composition
- Full-width pale input fields with rounded corners and visible borders
- Large pill CTA spanning the full width
- Underlined secondary text links for sign-in/sign-up switching
- OTP verification kept visually minimal and centered

This makes auth feel friendly and lightweight rather than security-heavy.

## Imagery and Brand Assets

The current asset system uses:

- Revenue/finance illustrations for auth screens:
  - [revenue-i1.png](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/images/revenue-i1.png)
  - [revenue-i3.png](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/images/revenue-i3.png)
- App branding assets:
  - [logo.png](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/images/logo.png)
  - [icon.png](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/images/icon.png)
  - Android adaptive icon assets in [assets/images](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/images)

The illustrations reinforce the product’s tone: practical, optimistic, and consumer-friendly.

## Component Patterns

### Inputs

Inputs are designed to feel soft and touch-friendly.

- Pale background
- Medium-to-large padding
- Rounded corners
- Visible slate border
- Usually Google Sans regular or medium
- Icons often appear on the left in input wrappers

Representative files:

- [components/FieldInputBox.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/FieldInputBox.jsx)
- [app/(auth)/sign-in.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/app/(auth)/sign-in.jsx)
- [app/(auth)/sign-up.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/app/(auth)/sign-up.jsx)

### Error States

Errors are handled with a warm but obvious alert style.

- Red left border for emphasis
- Soft red background rather than harsh solid red
- Icon + message + dismiss action
- Rounded corners consistent with the rest of the app

Representative file:

- [components/ErrorBanner.tsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/ErrorBanner.tsx)

### Empty States

Empty states are treated as onboarding moments rather than dead ends.

- Illustrated icon treatment
- Encouraging, plain-language copy
- Primary action button at the bottom
- Card container rather than plain text on background

Representative file:

- [components/NoTransactionFound.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/NoTransactionFound.jsx)

### Summary Cards

Financial summary UI uses card metaphors with clear hierarchy.

- Soft surface
- Bold numeric emphasis
- Muted label text
- Green for income, red for expense
- Divider to create symmetry between stats

Representative file:

- [components/BalanceCard.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/BalanceCard.jsx)

## Navigation and Safe Layout

Safe area behavior is handled through [components/SafeScreen.jsx](/Users/shreyas/Code/react native expo/expense-app/mobile/components/SafeScreen.jsx), which adds top inset padding and a `bg-background` shell.

This means the visual baseline for most screens is:

- Full-screen tinted background
- Content positioned within safe-area spacing
- No harsh edge collisions at the top of the display

## Theme Architecture

The intended architecture is light/dark theming through CSS variables and NativeWind class-based dark mode.

Key files:

- [global.css](/Users/shreyas/Code/react native expo/expense-app/mobile/global.css)
- [tailwind.config.js](/Users/shreyas/Code/react native expo/expense-app/mobile/tailwind.config.js)
- [constants/colors.js](/Users/shreyas/Code/react native expo/expense-app/mobile/constants/colors.js)

The design intent is clearly themeable, but most current implementation appears biased toward the light theme in practice.

## Known Inconsistencies

This section matters for transferability because it separates design intent from cleanup debt.

### Token Drift

There are two overlapping color systems:

- CSS variables in [global.css](/Users/shreyas/Code/react native expo/expense-app/mobile/global.css)
- JS theme objects in [constants/colors.js](/Users/shreyas/Code/react native expo/expense-app/mobile/constants/colors.js)

They are similar in direction but not identical in values.

### Legacy StyleSheet Files

Files such as:

- [assets/styles/auth.styles.js](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/styles/auth.styles.js)
- [assets/styles/home.styles.js](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/styles/home.styles.js)
- [assets/styles/create.styles.js](/Users/shreyas/Code/react native expo/expense-app/mobile/assets/styles/create.styles.js)

reference properties like `COLORS.text`, `COLORS.card`, `COLORS.white`, and `COLORS.textLight` that are not present in the current exported `COLORS` object. That suggests these files reflect an older theme system or are partially migrated.

### Tailwind Config Typo

In [tailwind.config.js](/Users/shreyas/Code/react native expo/expense-app/mobile/tailwind.config.js), `dangerBorder` maps to `var(--color-dangeBorder)` instead of `var(--color-dangerBorder)`.

### Mixed Styling Approaches

The codebase currently mixes:

- NativeWind utility classes
- Inline styles
- Older `StyleSheet.create` files

The dominant current design language appears to live in the NativeWind-driven components and auth screens.

## Rules To Preserve

If the app is redesigned or expanded, these choices should remain stable unless intentionally rebranded:

- Keep Google Sans as the brand typeface
- Keep blue as the primary trust color
- Keep the light blue background bias for softness
- Keep lime as a sparing, energetic accent rather than a base color
- Keep large rounded corners on inputs, cards, and CTAs
- Keep shadows subtle
- Keep empty and error states friendly rather than severe
- Keep auth flows centered, illustrative, and welcoming

## Short Brand Summary

If this app had to be described quickly to another designer or engineer:

It is a soft, blue-first finance app with Google Sans typography, rounded consumer-friendly controls, pale card surfaces, and lime-accent interaction feedback. The intended tone is trustworthy, optimistic, and approachable.
