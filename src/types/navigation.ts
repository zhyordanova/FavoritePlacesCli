import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  AllPlaces: undefined;
  AddPlace: undefined;
  Map:
    | {
        lat?: string;
        lng?: string;
        placeId?: string;
      }
    | undefined;
  PlaceDetails: { placeId: string };
};

export type AllPlacesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AllPlaces'
>;
export type PlaceDetailsRouteProp = RouteProp<
  RootStackParamList,
  'PlaceDetails'
>;
