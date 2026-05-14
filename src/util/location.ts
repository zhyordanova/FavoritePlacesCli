import Config from 'react-native-config';

const MAPBOX_ACCESS_TOKEN: string | null = Config.MAPBOX_ACCESS_TOKEN ?? null;

function requireMapboxToken(): string {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Missing MAPBOX_ACCESS_TOKEN');
  }

  return MAPBOX_ACCESS_TOKEN;
}

export function getMapPreview(lat: number, lng: number): string {
  const token = requireMapboxToken();
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},14/400x200?access_token=${token}`;
}

export async function getAddress(lat: number, lng: number): Promise<string> {
  const token = requireMapboxToken();
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch address!');
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error('No address found for the given coordinates.');
  }

  const address: string = data.features[0].place_name;

  return address;
}
