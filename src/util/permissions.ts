import {
  Alert,
  type Permission,
  PermissionsAndroid,
  Platform,
  type Rationale,
  Linking,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { ALERT_MESSAGES } from '../constants/alertMessages';

const deniedPermissionAttempts = new Map<string, number>();

export function resetPermissionDeniedAttempts(): void {
  deniedPermissionAttempts.clear();
}

function markPermissionGranted(permissionKey: string): void {
  deniedPermissionAttempts.delete(permissionKey);
}

function shouldShowSettingsAfterDenied(permissionKey: string): boolean {
  const attempts = deniedPermissionAttempts.get(permissionKey) ?? 0;
  deniedPermissionAttempts.set(permissionKey, attempts + 1);
  return attempts >= 1;
}

function getDeniedAttempts(permissionKey: string): number {
  return deniedPermissionAttempts.get(permissionKey) ?? 0;
}

export function openAppSettings(): void {
  Linking.openSettings().catch(() => {
    Alert.alert(
      ALERT_MESSAGES.common.errorTitle,
      ALERT_MESSAGES.errors.openSettingsFailed,
    );
  });
}

export function showOpenSettingsAlert(message: string): void {
  Alert.alert(ALERT_MESSAGES.common.permissionRequiredTitle, message, [
    { text: ALERT_MESSAGES.common.cancelButton, style: 'cancel' },
    { text: ALERT_MESSAGES.common.openSettingsButton, onPress: openAppSettings },
  ]);
}

async function ensureAndroidPermission(
  permission: Permission,
  settingsMessage: string,
  rationale?: Rationale,
): Promise<boolean> {
  const permissionKey = `android:${permission}`;
  const alreadyGranted = await PermissionsAndroid.check(permission);

  if (alreadyGranted) {
    markPermissionGranted(permissionKey);
    return true;
  }

  // After the first explicit deny, avoid opening the OS prompt again.
  // Show only the settings modal on next attempts.
  if (getDeniedAttempts(permissionKey) >= 1) {
    showOpenSettingsAlert(settingsMessage);
    return false;
  }

  const result = await PermissionsAndroid.request(permission, rationale);

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    markPermissionGranted(permissionKey);
    return true;
  }

  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    showOpenSettingsAlert(settingsMessage);
    return false;
  }

  if (shouldShowSettingsAfterDenied(permissionKey)) {
    showOpenSettingsAlert(settingsMessage);
  }

  return false;
}

async function ensureAnyAndroidPermission(
  permissions: Permission[],
  settingsMessage: string,
): Promise<boolean> {
  const permissionKey = `android:any:${[...permissions].sort().join('|')}`;
  const checks = await Promise.all(
    permissions.map(permission => PermissionsAndroid.check(permission)),
  );

  if (checks.some(Boolean)) {
    markPermissionGranted(permissionKey);
    return true;
  }

  // After first deny for this permission set, go straight to settings prompt.
  if (getDeniedAttempts(permissionKey) >= 1) {
    showOpenSettingsAlert(settingsMessage);
    return false;
  }

  const requestResult = await PermissionsAndroid.requestMultiple(permissions);
  const granted = permissions.some(
    permission => requestResult[permission] === PermissionsAndroid.RESULTS.GRANTED,
  );

  if (granted) {
    markPermissionGranted(permissionKey);
    return true;
  }

  const blocked = permissions.some(
    permission =>
      requestResult[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  );

  if (blocked) {
    showOpenSettingsAlert(settingsMessage);
    return false;
  }

  if (shouldShowSettingsAfterDenied(permissionKey)) {
    showOpenSettingsAlert(settingsMessage);
  }

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
    const permissionKey = 'ios:location:whenInUse';
    const status = await Geolocation.requestAuthorization('whenInUse');
    if (status === 'granted') {
      markPermissionGranted(permissionKey);
      return true;
    }

    if (shouldShowSettingsAfterDenied(permissionKey)) {
      showOpenSettingsAlert(settingsMessage);
    }

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
