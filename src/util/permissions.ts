import { Alert, Linking } from 'react-native';

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
