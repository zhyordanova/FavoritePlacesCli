export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceRow {
  id: string;
  title: string;
  imageUri: string;
  address: string;
  lat: number;
  lng: number;
}
