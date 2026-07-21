jest.mock('@op-engineering/op-sqlite', () => ({
  open: () => ({
    execute: jest.fn().mockResolvedValue({ rows: [] }),
  }),
}));

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function MockIonicons({ name }: { name?: string }) {
    return React.createElement(Text, null, name ?? 'icon');
  }

  MockIonicons.loadFont = jest.fn().mockResolvedValue(undefined);

  return MockIonicons;
});

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    saveAsset: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn().mockResolvedValue({ didCancel: true }),
  launchImageLibrary: jest.fn().mockResolvedValue({ didCancel: true }),
}));

jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn().mockResolvedValue('granted'),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('react-native-config', () => ({
  MAPBOX_ACCESS_TOKEN: 'test-mapbox-token',
}));
