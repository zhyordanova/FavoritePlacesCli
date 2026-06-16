# Favorite Places React Native CLI

## 🎯 Project Overview

A React Native CLI mobile app for **iOS** and **Android** that lets users save favorite places with a photo, a readable address, and map coordinates.

Built with **React Native CLI**, **TypeScript**, **SQLite**, and **Mapbox**, the project demonstrates native mobile integrations such as **camera/gallery access**, **location permissions**, **map-based place selection**, and **offline local persistence**.

The current implementation also includes a small **context-based map location handoff**, **centralized error logging/user messaging**, and a **graceful degraded mode** when the Mapbox token is missing.

---

## Preview

Screenshots and demo recordings from both platforms.

### Screenshots

| All Places | Add Place |
|---|---|
| ![All Places Screen](./assets/readme/all-places.png) | ![Add Place Screen](./assets/readme/add-place.png) |

| Map Picker | Place Details |
|---|---|
| ![Map Picker Screen](./assets/readme/map-picker.png) | ![Place Details Screen](./assets/readme/place-details.png) |

### Demo

Short demo recordings of the app running on both platforms.

#### iOS
<img src="./assets/readme/demo-ios.gif" alt="iOS Demo" width="320" />

#### Android
<img src="./assets/readme/demo-android.gif" alt="Android Demo" width="320" />

---


## 📸 Key Features

- Save favorite places with a custom title
- Capture a photo with the camera or choose one from the gallery
- Save camera-taken photos to a dedicated **FavoritePlaces** device album when permissions allow it
- Use the current GPS location or select a point directly on the map
- Reverse-geocode coordinates into a readable address
- Persist saved places locally with **SQLite**
- View saved places in a list and inspect them in a details screen
- Open saved places on a **Mapbox** map
- Handle loading, error, and retry states in important user flows
- Keep map-related flows usable with clear fallbacks when **Mapbox** is not configured

---

## 🛠️ Tech Stack

- **React Native CLI**
- **TypeScript**
- **React Navigation**
- **Mapbox** via `@rnmapbox/maps`
- **SQLite** via `@op-engineering/op-sqlite`
- **react-native-image-picker**
- **@react-native-camera-roll/camera-roll**
- **react-native-geolocation-service**
- **react-native-config**
- **react-native-bootsplash**
- **react-native-vector-icons**
- **react-native-view-shot**

---

## 💡 What This Project Demonstrates

- React Native CLI setup for both **Android** and **iOS**
- Type-safe screen navigation and component props with **TypeScript**
- Local offline persistence using **SQLite**
- Integration with native mobile features such as:
  - camera
  - gallery
  - location services
  - permissions
  - local photo library
- Interactive maps and reverse geocoding with **Mapbox**
- A hybrid permission model: reusable permission helpers plus a UI-friendly `usePermission` hook
- Context-based handoff for map-picked locations instead of a module-level singleton store
- Centralized developer-facing error logging with separate user-facing error messages
- Centralized alert copy via a shared `ALERT_MESSAGES` constants object
- Practical mobile UX work:
  - bootstrap initialization
  - loading states
  - retry actions
  - permission-denied flows
  - map loading fallback behavior
  - graceful map unavailable states when configuration is missing
- Basic project quality tooling with:
  - linting
  - formatting checks
  - type checking
  - GitHub Actions CI

---

## 📂 Project Structure

```text
src/
  components/   # Reusable UI and place-related components
  constants/    # Shared constants, alert copy, and styles
  hooks/        # Custom hooks (async state, place details, permissions)
  models/       # Domain models
  screens/      # Application screens
  store/        # Context-based lightweight shared state
  types/        # Shared TypeScript types
  util/         # Database, location, permission, error, and Mapbox helpers
```

---

## App Flow

### All Places
Displays all saved places loaded from the local SQLite database.

### Add Place
Lets the user:
- enter a title
- take a photo or choose one from the gallery
- use current location or pick a location on the map

### Map
Used for:
- selecting a location while creating a place
- viewing an existing saved place on the map

The screen includes loading handling, retry behavior, and a graceful unavailable state when **Mapbox** is not configured.

### Place Details
Shows:
- the saved image
- the resolved address
- a button to open the location on the map

The screen also includes loading, error, and retry states.

---

## 🚀 Getting Started

### Prerequisites

Before running the project, make sure you have:

- **Node.js** `22.11.0` or newer
- **npm**
- React Native environment set up
- **Android Studio** for Android
- **Xcode** and **CocoaPods** for iOS
- a valid **Mapbox access token** for full map functionality

Official React Native setup guide:  
https://reactnative.dev/docs/set-up-your-environment

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

An `.env.example` file is included in the repository as a template.

Get your token from [Mapbox](https://mapbox.com).

Without this token, the app still launches, but map rendering, map picking, static previews, and reverse geocoding are intentionally unavailable.

---

## Installation

Install dependencies:

```sh
npm install
```

### iOS only

Install Ruby gems if needed:

```sh
bundle install
```

Install CocoaPods dependencies:

```sh
bundle exec pod install --project-directory=ios
```

---

## Running the App

Start Metro:

```sh
npm start
```

### Run on Android

```sh
npm run android
```

### Run on iOS

```sh
npm run ios
```

---

## 📋 Permissions Required

This app may request access to:

- **Location**
- **Camera**
- **Photo Library / Gallery**

### Android
Depending on the OS version and device configuration, the app may request:
- camera permission
- fine location
- coarse location

### iOS
The app may request:
- when-in-use location permission
- camera access
- photo library access

If permission is denied permanently, the app can guide the user to system settings.

Permission handling uses a hybrid approach:
- low-level platform-specific permission helpers in `src/util/permissions.ts`
- a reusable `usePermission` hook for component-friendly permission requests
- delayed settings guidance so the app does not immediately redirect users after the first explicit deny

---

## 📊 Data Storage

Saved places are stored locally in **SQLite**.

Each place includes:
- `id`
- `title`
- `imageUri`
- `address`
- `lat`
- `lng`

This app does **not** use a backend or cloud sync. Data is stored locally on the device.

---

## 🗺️ Map and Geocoding

The app uses **Mapbox** for:
- map rendering
- static map preview generation
- reverse geocoding coordinates into an address

Mapbox configuration is centralized and initialized during app bootstrap.

If `MAPBOX_ACCESS_TOKEN` is missing, the app still starts. Map-related features switch to a degraded mode with clear user-facing messaging instead of failing during bootstrap.

---

## 🎓 Challenges and Lessons Learned

Some of the most interesting parts of the project were:

- handling platform-specific permission behavior on Android and iOS
- making the map screen more stable during loading and initialization
- improving bootstrap reliability to avoid silent startup failures
- separating developer-facing error logging from user-facing error messaging
- replacing a temporary module-level location handoff with a React Context-based solution
- integrating local device capabilities while keeping the codebase small and readable
- balancing simplicity and clean architecture for a learning-focused app

---

## 🤔 Known Limitations

- Some map functionality requires a valid **Mapbox** token, although the app now starts in a degraded mode without it
- Permission behavior can vary by platform and device version
- Data is stored locally and is not synced to a backend
- Automated test coverage is not a current focus of the project

---

## 🔮 Future Improvements

Possible future enhancements:

- edit or delete saved places
- improve visual polish and animations
- expand form validation
- introduce automated tests for core flows if the project scope grows

---

## ⚙️ Troubleshooting

### Map does not load
Check that your `.env` file exists and contains a valid:

```env
MAPBOX_ACCESS_TOKEN=...
```

Without a token, the app still launches, but map previews, map selection, and reverse geocoding are intentionally unavailable.

### iOS build issues
Run:

```sh
bundle exec pod install --project-directory=ios
```

Then rebuild from Xcode or rerun:

```sh
npm run ios
```

### Permission issues
Make sure camera, photo library, and location permissions are enabled for the app in device settings.

If you deny a permission once, the app does not immediately force a settings redirect. On a repeated attempt, it can guide you to system settings when needed.

---

## 👤 Author

Created as a portfolio project showcasing React Native CLI architecture, native integrations, and mobile development best practices..

For questions or feature ideas, feel free to open an issue or reach out.