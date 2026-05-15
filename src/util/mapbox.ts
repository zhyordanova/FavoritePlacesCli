import Mapbox from '@rnmapbox/maps';
import Config from 'react-native-config';

let isMapboxInitialized = false;

export function getMapboxAccessToken(): string {
  const token = Config.MAPBOX_ACCESS_TOKEN?.trim();

  if (!token) {
    throw new Error('Missing MAPBOX_ACCESS_TOKEN');
  }

  return token;
}

export function initializeMapbox(): void {
  if (isMapboxInitialized) {
    return;
  }

  Mapbox.setAccessToken(getMapboxAccessToken());
  isMapboxInitialized = true;
}
