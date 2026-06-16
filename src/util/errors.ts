import { Alert } from 'react-native';
import { ALERT_MESSAGES } from '../constants/alertMessages';

export type AppErrorScope =
  | 'app.bootstrap'
  | 'map.markerImage'
  | 'location.mapPickGeocoding'
  | 'location.currentPosition'
  | 'location.currentGeocoding';

const USER_ERROR_MESSAGES: Record<AppErrorScope, string> = {
  'app.bootstrap': 'Failed to initialize the app. Please restart it.',
  'map.markerImage': 'Could not load the place image for the map marker.',
  'location.mapPickGeocoding':
    'Could not retrieve the address for the selected location.',
  'location.currentPosition':
    'Could not fetch your location. Make sure location services are enabled on your device.',
  'location.currentGeocoding':
    'Could not retrieve the address for your location.',
};

export function getUserErrorMessage(scope: AppErrorScope): string {
  return USER_ERROR_MESSAGES[scope];
}

export function logAppError(
  scope: AppErrorScope,
  error: unknown,
  meta?: Record<string, unknown>,
): void {
  const details = {
    scope,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...meta,
  };

  console.error('[AppError]', details);
}

export function showUserErrorAlert(
  scope: AppErrorScope,
  title: string = ALERT_MESSAGES.errors.defaultAlertTitle,
): void {
  Alert.alert(title, getUserErrorMessage(scope));
}
