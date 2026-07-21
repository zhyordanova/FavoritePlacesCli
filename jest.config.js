module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['@rnmapbox/maps/setup-jest', '<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [],
};
