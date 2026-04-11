const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
// const rawApiUrl = "https://localhost:3000";

if (!rawApiUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_URL. Set it in mobile/.env before starting Expo.",
  )
}

export const API_URL = rawApiUrl.replace(/\/+$/, "");
