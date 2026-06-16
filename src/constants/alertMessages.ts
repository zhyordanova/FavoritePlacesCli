export const ALERT_MESSAGES = {
  common: {
    errorTitle: 'Error',
    cancelButton: 'Cancel',
    openSettingsButton: 'Open Settings',
    permissionRequiredTitle: 'Permission Required',
  },
  imagePicker: {
    cameraSettingsMessage:
      'Please enable camera access in Settings to continue.',
    cameraRationaleTitle: 'Camera Permission Required',
    cameraRationaleMessage: 'You need to allow camera access to take a photo.',
    cameraRationaleAllowButton: 'Allow',
    cameraRationaleDenyButton: 'Deny',
    gallerySettingsMessage:
      'Please enable photo library access in Settings to continue.',
    readImageFailed: 'Could not read the selected image.',
    cameraUnavailableTitle: 'Camera Unavailable',
    cameraUnavailableMessage:
      'Camera is not available on this device. On iOS Simulator, use Pick from Gallery or run the app on a physical iPhone.',
    cameraErrorTitle: 'Camera Error',
    cameraOpenFailed: 'Could not open camera.',
    galleryErrorTitle: 'Gallery Error',
    galleryOpenFailed: 'Could not open gallery.',
  },
  placeForm: {
    missingInformationTitle: 'Missing Information',
    missingInformationMessage:
      'Please enter a title, choose an image, and pick a location.',
  },
  locationPicker: {
    locationSettingsMessage:
      'Please enable location access in Settings to continue.',
    approximateLocationTitle: 'Approximate Location Active',
    approximateLocationMessage:
      'Your device is currently sharing approximate location. Use Pick on Map, or enable Precise Location in Settings for Locate User.',
    pickOnMapButton: 'Pick on Map',
    mapUnavailableTitle: 'Map Unavailable',
  },
  mapScreen: {
    noLocationPicked: 'No location picked!',
  },
  addPlace: {
    saveFailed: 'Could not save the place. Please try again.',
  },
  errors: {
    openSettingsFailed: 'Could not open app settings.',
    defaultAlertTitle: 'Error',
  },
} as const;
