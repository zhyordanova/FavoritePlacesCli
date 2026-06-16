import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OutlinedButton from '../ui/OutlinedButton';
import { ALERT_MESSAGES } from '../../constants/alertMessages';
import { sharedPickerStyles } from '../../constants/sharedStyles';
import { CAMERA_OPTIONS } from '../../constants/imagePicker';
import { usePermission } from '../../hooks/usePermission';
import { showOpenSettingsAlert } from '../../util/permissions';

interface ImagePickerProps {
  onTakeImage: (uri: string) => void;
  selectedImage: string | undefined;
}

export default function ImagePicker({
  onTakeImage,
  selectedImage,
}: ImagePickerProps) {
  const { request: requestCameraPermission } = usePermission({
    resource: 'camera',
    settingsMessage: ALERT_MESSAGES.imagePicker.cameraSettingsMessage,
    cameraRationale: {
      title: ALERT_MESSAGES.imagePicker.cameraRationaleTitle,
      message: ALERT_MESSAGES.imagePicker.cameraRationaleMessage,
      buttonPositive: ALERT_MESSAGES.imagePicker.cameraRationaleAllowButton,
      buttonNegative: ALERT_MESSAGES.imagePicker.cameraRationaleDenyButton,
    },
  });

  async function processImageResult(
    image: ImagePickerResponse,
    saveToLibrary: boolean,
  ): Promise<void> {
    if (image.didCancel || !image.assets || image.assets.length === 0) {
      return;
    }

    const uri = image.assets[0].uri;
    if (!uri) {
      Alert.alert(
        ALERT_MESSAGES.common.errorTitle,
        ALERT_MESSAGES.imagePicker.readImageFailed,
      );
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
        album: 'FavoritePlaces',
      });
    } catch {
      // On some devices this can fail if Photos permission is denied.
    }
  }

  async function takeImageHandler(): Promise<void> {
    const permissionStatus = await requestCameraPermission();
    if (permissionStatus !== 'granted') {
      return;
    }

    const image = await launchCamera(CAMERA_OPTIONS);

    if (image.errorCode) {
      if (image.errorCode === 'permission') {
        showOpenSettingsAlert(ALERT_MESSAGES.imagePicker.cameraSettingsMessage);
        return;
      }

      if (image.errorCode === 'camera_unavailable') {
        Alert.alert(
          ALERT_MESSAGES.imagePicker.cameraUnavailableTitle,
          ALERT_MESSAGES.imagePicker.cameraUnavailableMessage,
        );
        return;
      }

      Alert.alert(
        ALERT_MESSAGES.imagePicker.cameraErrorTitle,
        image.errorMessage ?? ALERT_MESSAGES.imagePicker.cameraOpenFailed,
      );
      return;
    }

    await processImageResult(image, true);
  }

  async function pickImageHandler(): Promise<void> {
    const image = await launchImageLibrary(CAMERA_OPTIONS);

    if (image.errorCode) {
      if (image.errorCode === 'permission') {
        showOpenSettingsAlert(ALERT_MESSAGES.imagePicker.gallerySettingsMessage);
        return;
      }

      Alert.alert(
        ALERT_MESSAGES.imagePicker.galleryErrorTitle,
        image.errorMessage ?? ALERT_MESSAGES.imagePicker.galleryOpenFailed,
      );
      return;
    }

    await processImageResult(image, false);
  }

  let imagePreview = (
    <Text style={sharedPickerStyles.statusText}>No image taken yet.</Text>
  );

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
