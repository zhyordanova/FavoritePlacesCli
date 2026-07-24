import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import Analytics from 'appcenter-analytics';

import { RootStackParamList } from '../types/navigation';

import PlaceForm from '../components/places/PlaceForm';
import { ALERT_MESSAGES } from '../constants/alertMessages';
import { insertPlace } from '../util/database';
import { Place } from '../models/place';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPlace'>;

export default function AddPlace({ navigation }: Props) {
  async function createPlaceHandler(place: Place) {
    try {
      await insertPlace(place);
      await Analytics.trackEvent('place_added', {
        title: place.title,
        hasImage: String(!!place.imageUri),
        latitude: String(place.location.lat),
        longitude: String(place.location.lng),
      });
      navigation.goBack();
    } catch {
      Alert.alert(
        ALERT_MESSAGES.common.errorTitle,
        ALERT_MESSAGES.addPlace.saveFailed,
      );
    }
  }

  return <PlaceForm onCreatePlace={createPlaceHandler} />;
}
