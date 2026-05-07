import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import OutlinedButton from '../UI/OutlinedButton';
import { Colors } from '../../constants/colors';
import { CAMERA_OPTIONS } from '../../constants/imagePicker';

interface ImagePickerProps {
  onTakeImage: (uri: string) => void;
  selectedImage: string | undefined;
}

export default function ImagePicker({
  onTakeImage,
  selectedImage,
}: ImagePickerProps) {
  async function processImageResult(
    image: ImagePickerResponse,
    saveToLibrary: boolean,
  ): Promise<void> {
    if (image.didCancel || !image.assets || image.assets.length === 0) {
      return;
    }

    const uri = image.assets[0].uri;
    if (!uri) {
      Alert.alert('Error', 'Could not read the selected image.');
      return;
    }

    if (saveToLibrary) {
      await saveToAlbum(uri);
    }

    onTakeImage(uri);
  }

  async function saveToAlbum(uri: string): Promise<void> {
    try {
      await CameraRoll.saveAsset(uri, {
        type: 'photo',
        album: 'FavouritePlaces',
      });
    } catch {
      // On some devices this can fail if Photos permission is denied.
    }
  }

  async function takeImageHandler(): Promise<void> {
    const image = await launchCamera(CAMERA_OPTIONS);

    if (image.errorCode) {
      Alert.alert(
        'Camera Error',
        image.errorMessage ?? 'Could not open camera.',
      );
      return;
    }

    await processImageResult(image, true);
  }

  async function pickImageHandler(): Promise<void> {
    const image = await launchImageLibrary(CAMERA_OPTIONS);

    if (image.errorCode) {
      Alert.alert(
        'Gallery Error',
        image.errorMessage ?? 'Could not open gallery.',
      );
      return;
    }

    await processImageResult(image, false);
  }

  let imagePreview = <Text>No image taken yet.</Text>;

  if (selectedImage) {
    imagePreview = (
      <Image style={styles.image} source={{ uri: selectedImage }} />
    );
  }

  return (
    <View>
      <View style={styles.imagePreview}>{imagePreview}</View>
      <View style={styles.actions}>
        <OutlinedButton icon="camera-outline" onPress={takeImageHandler}>
          Take Image
        </OutlinedButton>

        <OutlinedButton icon="image-outline" onPress={pickImageHandler}>
          Pick from Gallery
        </OutlinedButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imagePreview: {
    height: 200,
    marginVertical: 12,
    marginHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
    borderColor: Colors.primary500,
    borderWidth: 2,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
