import {
  Alert,
  type Permission,
  PermissionsAndroid,
  Platform,
  type Rationale,
  Linking,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export function openAppSettings(): void {
  Linking.openSettings().catch(() => {
    Alert.alert('Error', 'Could not open app settings.');
  });
}

export function showOpenSettingsAlert(message: string): void {
  Alert.alert('Permission Required', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Open Settings', onPress: openAppSettings },
  ]);
}

async function ensureAndroidPermission(
  permission: Permission,
  settingsMessage: string,
  rationale?: Rationale,
): Promise<boolean> {
  const alreadyGranted = await PermissionsAndroid.check(permission);

  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, rationale);

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  showOpenSettingsAlert(settingsMessage);
  return false;
}

async function ensureAnyAndroidPermission(
  permissions: Permission[],
  settingsMessage: string,
): Promise<boolean> {
  const checks = await Promise.all(
    permissions.map(permission => PermissionsAndroid.check(permission)),
  );

  if (checks.some(Boolean)) {
    return true;
  }

  const requestResult = await PermissionsAndroid.requestMultiple(permissions);
  const granted = permissions.some(
    permission => requestResult[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );

  if (granted) {
    return true;
  }

  showOpenSettingsAlert(settingsMessage);
  return false;
}

export async function ensureCameraPermission(
  settingsMessage: string,
  rationale?: Rationale,
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS permission is requested by the camera API when opening camera.
    return true;
  }

  return ensureAndroidPermission(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    settingsMessage,
    rationale,
  );
}

export async function ensureLocationPermission(
  settingsMessage: string,
): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization('whenInUse');
    if (status === 'granted') {
      return true;
    }

    showOpenSettingsAlert(settingsMessage);
    return false;
  }

  const finePermission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const coarsePermission =
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

  return ensureAnyAndroidPermission(
    [finePermission, coarsePermission],
    settingsMessage,
  );
}
