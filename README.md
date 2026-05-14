# FavouritePlacesCli

A React Native CLI app for iOS and Android that lets users save favourite places with a photo, a resolved address, and map coordinates.

Users can:
- take or choose a photo
- use current GPS location or pick a place on the map
- reverse-geocode coordinates into a readable address
- save places locally with SQLite
- open saved places and view them on a map

## Features

- React Native CLI project for **Android** and **iOS**
- Built with **TypeScript**
- Local persistence using **SQLite**
- Map selection and preview using **Mapbox**
- Device location support
- Camera and gallery image selection
- Native navigation with stack screens
- Offline storage for saved places

## Tech Stack

- **React Native**
- **TypeScript**
- **React Navigation**
- **Mapbox** via `@rnmapbox/maps`
- **SQLite** via `@op-engineering/op-sqlite`
- **react-native-image-picker**
- **react-native-geolocation-service**
- **react-native-config**
- **react-native-vector-icons**

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
Displays all saved places from the local SQLite database.

### Add Place
Allows the user to:
- enter a title
- take a photo or pick one from the gallery
- use current location or select one on the map

### Map
Used for:
- picking a location when creating a place
- viewing a saved place on the map

### Place Details
Shows:
- place image
- resolved address
- option to open the location on the map

## Requirements

Before running the app, make sure you have:

- Node.js
- npm
- React Native development environment set up
- Android Studio for Android
- Xcode + CocoaPods for iOS
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

Install CocoaPods dependencies:

```sh
bundle exec pod install
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

This app uses native device features and may request permissions for:

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

If permission is denied permanently, the app may prompt the user to open system settings.

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

## Development Scripts

```json
{
  "android": "react-native run-android",
  "ios": "react-native run-ios",
  "lint": "eslint .",
  "start": "react-native start",
  "test": "jest"
}
```

## Known Limitations

- Requires a valid Mapbox token to work correctly
- Some permission behavior may vary by platform/device version
- Saved data is local to the device and is not synced to a backend
- Error handling can still be improved for some initialization and network failure cases

## Future Improvements

Possible next steps:
- improve app startup and error states
- add edit/delete place support
- add better form validation
- replace temporary in-memory picked-location state with a more robust flow
- improve test coverage
- extend CI to run automated tests
- add screenshots or demo GIFs to this README

## Troubleshooting

### App crashes or map does not load
Check that `.env` exists and contains a valid:

```env
MAPBOX_ACCESS_TOKEN=...
```

### iOS build issues
Try:

```sh
bundle exec pod install
```

and rebuild from Xcode or rerun:

```sh
npm run ios
```

### Android permission issues
Make sure location and camera permissions are enabled for the app in device settings.

## Author

Built as a React Native mobile app project for saving favourite places with photos and map-based location selection.