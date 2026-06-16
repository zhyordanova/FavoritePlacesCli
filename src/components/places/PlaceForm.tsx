import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Button from '../ui/Button';
import { ALERT_MESSAGES } from '../../constants/alertMessages';
import ImagePicker from './ImagePicker';
import LocationPicker from './LocationPicker';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Place } from '../../models/place';
import { Location } from '../../types';

interface PlaceFormProps {
  onCreatePlace: (place: Place) => void;
}

export default function PlaceForm({ onCreatePlace }: PlaceFormProps) {
  const [enteredTitle, setEnteredTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [pickedLocation, setPickedLocation] = useState<Location | undefined>();

  function changeTitleHandler(enteredText: string) {
    setEnteredTitle(enteredText);
  }

  function takeImageHandler(imageUri: string) {
    setSelectedImage(imageUri);
  }

  const pickLocationHandler = useCallback((location: Location) => {
    setPickedLocation(location);
  }, []);

  function savePlaceHandler() {
    const normalizedTitle = enteredTitle.trim();

    if (!normalizedTitle || !selectedImage || !pickedLocation) {
      Alert.alert(
        ALERT_MESSAGES.placeForm.missingInformationTitle,
        ALERT_MESSAGES.placeForm.missingInformationMessage,
      );
      return;
    }

    const placeData = new Place(normalizedTitle, selectedImage, pickedLocation);
    onCreatePlace(placeData);
  }

  const isFormValid =
    enteredTitle.trim().length > 0 && !!selectedImage && !!pickedLocation;

  return (
    <ScrollView>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          onChangeText={changeTitleHandler}
          value={enteredTitle}
        />
      </View>

      <ImagePicker
        onTakeImage={takeImageHandler}
        selectedImage={selectedImage}
      />

      <LocationPicker
        onPickLocation={pickLocationHandler}
        pickedLocation={pickedLocation}
      />

      <Button onPress={savePlaceHandler} disabled={!isFormValid}>
        Add Place
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    padding: Spacing.xxl,
  },

  label: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    color: Colors.primary500,
  },

  input: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    fontSize: 16,
    borderColor: Colors.primary500,
    borderWidth: 2,
    backgroundColor: Colors.primary100,
  },
});
