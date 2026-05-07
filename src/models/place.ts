import { Location } from "../types";

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
    this.id = id ?? new Date().toString() + Math.random().toString();
    this.title = title;
    this.imageUri = imageUri;
    this.address = location.address;
    this.location = { lat: location.lat, lng: location.lng };
  }
}
