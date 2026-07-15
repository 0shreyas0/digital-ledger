<div align="center">
  <img src="https://img.shields.io/badge/React_Native-0.85-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-SDK_56-1B1F23?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo_Router-v56-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Clerk-Auth-black?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/NativeWind-Styling-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />

  <h1>Digital Ledger Mobile</h1>
  <p>Expo frontend for tracking expenses, income, categories, and tags with a premium, platform-native UI.</p>
</div>

---

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Framework</strong><br />React Native + Expo</td>
      <td align="center"><strong>Routing</strong><br />Expo Router</td>
      <td align="center"><strong>Auth</strong><br />Clerk Expo</td>
      <td align="center"><strong>Styling</strong><br />NativeWind</td>
    </tr>
  </table>
</div>

## Overview

**Digital Ledger Mobile** is a polished React Native application built to help users manage their personal finances from a phone-first interface. The frontend emphasizes platform-native UI (SwiftUI-backed components on iOS, a custom animated tab bar on Android), secure authentication, clear transaction flows, and rich analytics.

## Features

- **Authentication:** Secure sign-in and sign-up flows with OTP verification, powered by Clerk.
- **Dynamic Dashboard:** Displays real-time balance, income, and expense data fetched from the backend API.
- **Transaction Management:** Create, browse, filter, search, edit, and delete transactions with a mobile-friendly interface.
- **Custom Categories:** Personalized transaction categories with icon-based visual organization. Full create/edit/delete support.
- **Tags:** User-defined tags to add extra context to transactions. Full CRUD support on both frontend and backend.
- **Analytics:** SVG-based line chart on the Activity screen showing spending trends over time.
- **Advanced Filtering:** Filter the activity feed by category, tag, transaction type, and date range via a native bottom sheet.
- **Edit Transactions:** Dedicated edit screen to update any field of an existing transaction.
- **Profile & Settings:** Profile screen showing user info; Settings screen for theme and glass-effect opacity controls.
- **Theme Support:** Light and dark mode, user-configurable at runtime.
- **Platform-Native UI:** iOS uses SwiftUI-backed components (`@expo/ui`, `expo-blur`, `expo-glass-effect`); Android uses a custom animated floating tab bar with spring animations.
- **Navigation:** Expo Router with auth-gated routes, a side drawer, and a bottom tab bar.

## Tech Stack

- React Native `0.85.3`
- Expo `^56.0.0`
- Expo Router `~56.2.11`
- Clerk Expo `^2.19.17`
- NativeWind `^4.2.1`
- `@expo/ui`, `expo-blur`, `expo-glass-effect`
- `lucide-react-native`, `@expo/vector-icons`
- `react-native-svg` (charts)
- `react-native-reanimated`, `react-native-gesture-handler`
- `react-native-calendars`, `react-native-modal`

## Requirements

- Node.js 18+
- npm
- Expo Go or a simulator/emulator
- A running backend API
- A Clerk application with a publishable key

## Environment Setup

Create `mobile/.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=http://192.168.1.X:5001/api
```

- `localhost` only works when the simulator/emulator can reach the backend on the same machine.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run start
```

Other useful commands:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Backend Dependency

The app reads `EXPO_PUBLIC_API_URL` and sends requests to the backend for:

- transactions (list, summary, create, edit, delete)
- categories (list, create, edit, delete)
- tags (list, create, edit, delete)

If the backend is unavailable or the API URL is incorrect, the app will open but data requests will fail.

## Project Structure

```text
app/           Expo Router screens and layouts
  (auth)/      Sign-in and sign-up screens
  (protected)/ Auth-gated screens
    (drawer)/  Drawer navigation and drawer screens (profile, settings)
      (tabs)/  Bottom tab screens (Home, Activity, Create, Social, Fields)
    category/  Category detail/edit screen
    tag/       Tag detail/edit screen
    edit.jsx   Edit transaction screen
components/    Shared UI components
  analytics/   Chart components (Graph)
  fields/      Form field components
  modals/      Bottom sheet modal components
  pressables/  Platform-specific pressable components
constants/     API config, colors, and category icon map
context/       Theme and transaction state providers
hooks/         Data-fetching hooks (transactions, categories, tags)
assets/        Fonts and images
```

## Build

Android build:

```bash
npx eas build -p android --profile preview
```

iOS build:

```bash
npx eas build -p ios --profile preview
```
