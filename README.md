# Digital Ledger Mobile

React Native + Expo frontend for the Digital Ledger expense tracking app.

## Stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- Clerk Expo
- NativeWind

## Features

- Email/password authentication with Clerk
- Transaction list with balance, income, and expense summaries
- Create and delete transactions
- Category management
- Drawer and tab navigation with Expo Router

## Requirements

- Node.js 18+
- npm
- Expo Go on a physical device, or an iOS Simulator / Android Emulator
- A running backend API
- A Clerk application

## Environment Variables

Create `mobile/.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=http://192.168.1.X:5001/api
```

Notes:

- `EXPO_PUBLIC_*` variables are bundled into the client app. Do not put secrets in them.
- Use your machine's local network IP for `EXPO_PUBLIC_API_URL` when testing on a physical device.
- `localhost` only works when the simulator/emulator can reach the backend running on the same machine.

## Run Locally

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Useful commands:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Backend Dependency

This app depends on the backend API being available. The mobile app calls the backend using `EXPO_PUBLIC_API_URL` for:

- auth-protected transaction requests
- summary data
- category CRUD operations

If the backend is not running or the API URL is wrong, the app will load but network requests will fail.

## Project Structure

```text
app/           Expo Router screens and layouts
components/    Reusable UI components
constants/     API config, colors, and shared constants
hooks/         Data fetching and screen logic
assets/        Fonts and images
```

## Build

For local development builds or production builds with EAS:

```bash
npx eas build -p android --profile preview
```

Use the equivalent iOS command when needed:

```bash
npx eas build -p ios --profile preview
```
