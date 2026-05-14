import { open } from '@op-engineering/op-sqlite';

import { Place } from '../models/place';
import { PlaceRow } from '../types';

const db = open({ name: 'places.db' });

function mapRowToPlace(row: PlaceRow): Place {
  return new Place(
    row.title,
    row.imageUri,
    { address: row.address, lat: row.lat, lng: row.lng },
    row.id,
  );
}

export async function init(): Promise<void> {
  await db.execute(`CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    imageUri TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL
  )`);
}

export async function insertPlace(place: Place): Promise<void> {
  await db.execute(
    `INSERT INTO places (id, title, imageUri, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      place.id,
      place.title,
      place.imageUri,
      place.address,
      place.location.lat,
      place.location.lng,
    ],
  );
}

export async function fetchPlaces(): Promise<Place[]> {
  const result = await db.execute(`SELECT * FROM places`);
  const rows = (result.rows ?? []) as unknown as PlaceRow[];

  return rows.map(mapRowToPlace);
}

export async function fetchPlaceDetails(id: string): Promise<Place> {
  const result = await db.execute(`SELECT * FROM places WHERE id = ?`, [id]);
  const row = (result.rows?.[0] ?? null) as unknown as PlaceRow | null;

  if (!row) {
    throw new Error('Could not find place with the provided id.');
  }

  return mapRowToPlace(row);
}
