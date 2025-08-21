/**
 * @format
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AccountScreen from '../src/screens/AccountScreen/AccountScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

test(
  'persists avatar after selection',
  async () => {
    (launchImageLibrary as jest.Mock).mockImplementation((_options, callback) => {
      callback({ assets: [{ uri: 'mock://avatar.png' }] });
    });

    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(<AccountScreen />);
    });

    await act(async () => {
      component.root.findByProps({ testID: 'avatar-picker' }).props.onPress();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'userProfile',
      expect.stringContaining('mock://avatar.png'),
    );
  },
  10000,
);
