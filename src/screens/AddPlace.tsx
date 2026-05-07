import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

import { RootStackParamList } from '../types/navigation';

import PlaceForm from '../components/Places/PlaceForm';
import { insertPlace } from '../util/database';
import { Place } from '../models/place';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPlace'>;

export default function AddPlace({ navigation }: Props) {
  async function createPlaceHandler(place: Place) {
    try {
      await insertPlace(place);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save the place. Please try again.');
    }
  }

  return <PlaceForm onCreatePlace={createPlaceHandler} />;
}
