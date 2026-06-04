import { open } from '@op-engineering/op-sqlite';

import { Place } from '../models/place';
import { PlaceRow } from '../types';

const db = open({ name: 'places.db' });

type TableInfoRow = {
  name?: string;
};

async function hasCreatedAtColumn(): Promise<boolean> {
  const result = await db.execute(`PRAGMA table_info(places)`);
  const rows = (result.rows ?? []) as unknown as TableInfoRow[];

  return rows.some(row => row.name === 'createdAt');
}

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
    lng REAL NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  )`);

  const hasCreatedAt = await hasCreatedAtColumn();

  if (!hasCreatedAt) {
    await db.execute(
      `ALTER TABLE places ADD COLUMN createdAt INTEGER NOT NULL DEFAULT 0`,
    );
  }

  await db.execute(
    `UPDATE places SET createdAt = CAST(strftime('%s', 'now') AS INTEGER) WHERE createdAt IS NULL OR createdAt = 0`,
  );
}

export async function insertPlace(place: Place): Promise<void> {
  await db.execute(
    `INSERT INTO places (id, title, imageUri, address, lat, lng, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      place.id,
      place.title,
      place.imageUri,
      place.address,
      place.location.lat,
      place.location.lng,
      Math.floor(Date.now() / 1000),
    ],
  );
}

export async function fetchPlaces(): Promise<Place[]> {
  const result = await db.execute(
    `SELECT * FROM places ORDER BY createdAt DESC`,
  );
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
