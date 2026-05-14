import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OutlinedButton from '../UI/OutlinedButton';
import { sharedPickerStyles } from '../../constants/sharedStyles';
import { CAMERA_OPTIONS } from '../../constants/imagePicker';
import { showOpenSettingsAlert } from '../../util/permissions';

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

  async function verifyCameraPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission Required',
        message: 'You need to allow camera access to take a photo.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      showOpenSettingsAlert(
        'Please enable camera access in Settings to continue.',
      );
      return false;
    }

    showOpenSettingsAlert(
      'Please enable camera access in Settings to continue.',
    );
    return false;
  }

  async function takeImageHandler(): Promise<void> {
    const hasPermission = await verifyCameraPermissions();
    if (!hasPermission) {
      return;
    }

    const image = await launchCamera(CAMERA_OPTIONS);

    if (image.errorCode) {
      if (image.errorCode === 'permission') {
        showOpenSettingsAlert(
          'Please enable camera access in Settings to continue.',
        );
        return;
      }

      if (image.errorCode === 'camera_unavailable') {
        Alert.alert(
          'Camera Unavailable',
          'Camera is not available on this device. On iOS Simulator, use Pick from Gallery or run the app on a physical iPhone.',
        );
        return;
      }

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
      if (image.errorCode === 'permission') {
        showOpenSettingsAlert(
          'Please enable photo library access in Settings to continue.',
        );
        return;
      }

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
      <View style={sharedPickerStyles.preview}>{imagePreview}</View>
      <View style={sharedPickerStyles.actions}>
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
  image: {
    width: '100%',
    height: '100%',
  },
});
