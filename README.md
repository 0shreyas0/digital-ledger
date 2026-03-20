<div align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-SDK_54-1B1F23?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo_Router-v6-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Clerk-Auth-black?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/NativeWind-Styling-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />

  <h1>Digital Ledger Mobile</h1>
  <p>Expo frontend for tracking expenses, income, and categories with a clean mobile-first UI.</p>
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

**Digital Ledger Mobile** is a polished React Native application built to help users stay on top of their finances from a phone-first interface. The frontend focuses on secure authentication, responsive navigation, clear transaction flows, and an interface that makes balances, expenses, income, and categories easy to manage.

## Features

- **Authentication:** Secure sign in and sign up flows powered by Clerk.
- **Dynamic Dashboard:** Displays real-time balance, income, and expense data fetched from the backend API.
- **Transaction Management:** Lets users create, browse, and delete transactions with a mobile-friendly interface.
- **Custom Categories:** Supports personalized transaction categories with icon-based visual organization.
- **Navigation:** Uses Expo Router for structured auth, drawer, and tab navigation flows.
- **Sleek UI/UX:** Styled with NativeWind to keep the interface consistent, modern, and responsive.

## Tech Stack

- React Native `0.81.5`
- Expo `~54.0.31`
- Expo Router `~6.0.21`
- Clerk Expo `^2.19.17`
- NativeWind `^4.2.1`

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

- transactions
- transaction summary
- categories

If the backend is unavailable or the API URL is incorrect, the app will open but data requests will fail.

## Project Structure

```text
app/           Expo Router screens and layouts
components/    Shared UI components
constants/     API config, colors, and shared constants
hooks/         Data fetching and app logic
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
