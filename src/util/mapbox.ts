import Mapbox from '@rnmapbox/maps';
import Config from 'react-native-config';

let isMapboxInitialized = false;
let isMapboxEnabled = false;

const MISSING_TOKEN_REASON =
  'Map features are unavailable because MAPBOX_ACCESS_TOKEN is not configured.';

export function isMapboxAvailable(): boolean {
  return isMapboxEnabled;
}

export function getMapboxUnavailableReason(): string {
  return MISSING_TOKEN_REASON;
}

export function getMapboxAccessToken(): string {
  const token = Config.MAPBOX_ACCESS_TOKEN?.trim();

  if (!token) {
    throw new Error('Missing MAPBOX_ACCESS_TOKEN');
  }

  return token;
}

export function initializeMapbox(): boolean {
  if (isMapboxInitialized) {
    return isMapboxEnabled;
  }

  const token = Config.MAPBOX_ACCESS_TOKEN?.trim();

  if (!token) {
    isMapboxEnabled = false;
    return false;
  }

  Mapbox.setAccessToken(token);
  isMapboxInitialized = true;
  isMapboxEnabled = true;
  return true;
}
