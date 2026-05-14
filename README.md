# FavouritePlacesCli

A React Native CLI app for iOS and Android that lets users save favourite places with a photo, an address, and map coordinates.

Users can:
- take a photo or choose one from the gallery
- use the current GPS location or pick a point on the map
- reverse-geocode coordinates into a readable address
- save places locally with SQLite
- open saved places and inspect them on a map

## Current State

The app is fully wired for local, offline place storage and uses Mapbox for map rendering, previews, and geocoding.

The current UX includes:
- an app bootstrap screen that waits for fonts and the local database to initialize
- loading and retry states for the map screen
- loading, error, and retry states for place details
- permission prompts for camera, gallery, and location access

## Features

- React Native CLI project for **Android** and **iOS**
- Built with **TypeScript**
- Local persistence using **SQLite**
- Map selection and preview using **Mapbox**
- Device location support
- Camera and gallery image selection
- Native stack navigation
- Offline storage for saved places

## Tech Stack

- **React Native** 0.85.2
- **TypeScript**
- **React Navigation**
- **Mapbox** via `@rnmapbox/maps`
- **SQLite** via `@op-engineering/op-sqlite`
- **react-native-bootsplash**
- **react-native-image-picker**
- **react-native-geolocation-service**
- **react-native-config**
- **react-native-vector-icons**
- **react-native-view-shot**
- **@react-native-camera-roll/camera-roll**

## Project Structure

```text
src/
  components/
    Places/
    UI/
  constants/
  hooks/
  models/
  screens/
  store/
  types/
  util/
```

## Screens / Flow

### All Places
Lists all saved places from the local SQLite database.

### Add Place
Lets the user:
- enter a title
- take a photo or pick one from the gallery
- use the current location or select one on the map

### Map
Used both for:
- picking a location when creating a place
- viewing a saved place on the map

The screen currently shows a loading overlay while the map initializes and offers a retry action if the map takes too long to load.

### Place Details
Shows:
- the saved image
- the resolved address
- a button to open the location on the map

It also has explicit loading and error states with a retry action if the place cannot be loaded.

## Requirements

Before running the app, make sure you have:

- Node.js 22.11.0 or newer
- npm
- React Native development environment set up
- Android Studio for Android
- Xcode and CocoaPods for iOS
- a valid **Mapbox access token**

Official React Native environment setup guide:  
https://reactnative.dev/docs/set-up-your-environment

## Environment Variables

This project requires a Mapbox token.

Create a `.env` file in the project root:

```env
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

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

Install CocoaPods dependencies with the bundled version:

```sh
bundle exec pod install --project-directory=ios
```

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

## Permissions

This app may request permissions for:

- **Location**
- **Camera**
- **Photo Library / Gallery**

### Android
Depending on device version and settings, the app may request:
- camera permission
- fine location
- coarse location

### iOS
The app may request:
- when-in-use location permission
- camera access
- photo library access

If permission is denied permanently, the app can prompt the user to open system settings.

## Data Storage

Saved places are stored locally in SQLite.

Each place includes:
- `id`
- `title`
- `imageUri`
- `address`
- `lat`
- `lng`

## Map and Geocoding

The app uses Mapbox for:
- map rendering
- static map preview generation
- reverse geocoding coordinates into an address

Mapbox token lookup is handled through `react-native-config`, and the app reads it only when map or geocoding helpers are used.

## Development Scripts

```json
{
  "android": "react-native run-android",
  "format": "prettier --write \"App.tsx\" \"index.js\" \"src/**/*.{ts,tsx,js,jsx}\"",
  "format:check": "prettier --check \"App.tsx\" \"index.js\" \"src/**/*.{ts,tsx,js,jsx}\"",
  "ios": "react-native run-ios",
  "lint": "eslint .",
  "start": "react-native start",
  "test": "jest"
}
```

## CI

The repository includes a GitHub Actions workflow that runs:
- `npm ci`
- `npm run lint`
- `npm run format:check`

## Known Limitations

- Requires a valid Mapbox token to work correctly
- Permission behavior can vary by platform and device version
- Saved data is local to the device and is not synced to a backend
- The picked location returned from the map screen still uses a temporary in-memory store

## Future Improvements

Possible next steps:
- replace the temporary in-memory picked-location flow with navigation params or another persistent handoff
- add edit/delete place support
- add more form validation
- add screenshots or a demo GIF to this README
- extend automated test coverage

## Troubleshooting

### App crashes or map does not load
Check that `.env` exists and contains a valid:

```env
MAPBOX_ACCESS_TOKEN=...
```

### iOS build issues
Run:

```sh
bundle exec pod install --project-directory=ios
```

then rebuild from Xcode or rerun:

```sh
npm run ios
```

### Android permission issues
Make sure location and camera permissions are enabled for the app in device settings.

## Author

Built as a React Native mobile app project for saving favourite places with photos and map-based location selection.