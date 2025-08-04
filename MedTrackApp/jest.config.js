module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@notifee/react-native$': '<rootDir>/__mocks__/notifeeReactNative.js',
    '^react-native-image-picker$': '<rootDir>/__mocks__/react-native-image-picker.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|@react-native-community/datetimepicker|@react-native-picker/picker|react-native-date-picker|react-native-chart-kit|react-native-image-picker)/)',
  ],
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
    '<rootDir>/jestSetup.js',
  ],
};
