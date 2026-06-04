import { Location } from '../types';

function createPlaceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export class Place {
  id: string;
  title: string;
  imageUri: string;
  address: string;
  location: { lat: number; lng: number };

  constructor(
    title: string,
    imageUri: string,
    location: Location,
    id?: string,
  ) {
    this.id = id ?? createPlaceId();
    this.title = title;
    this.imageUri = imageUri;
    this.address = location.address;
    this.location = { lat: location.lat, lng: location.lng };
  }
}
