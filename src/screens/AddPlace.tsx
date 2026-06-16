import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

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
