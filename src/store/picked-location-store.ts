import { Coordinates } from "../types";

let pickedMapLocation: Coordinates | undefined;

export function setPickedMapLocation(location: Coordinates): void {
  pickedMapLocation = location;
}

export function consumePickedMapLocation(): Coordinates | undefined {
  const location = pickedMapLocation;
  pickedMapLocation = undefined;
  return location;
}
