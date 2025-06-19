import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'LiveActivityManager' doesn't seem to be linked. Make sure the library is added to your Xcode project.`;

const LiveActivity = NativeModules.LiveActivityManager
  ? NativeModules.LiveActivityManager
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

export function startLiveActivity(name: string, durationSec: number): Promise<void> {
  if (Platform.OS === 'ios') {
    return LiveActivity.start(name, durationSec);
  }
  return Promise.resolve();
}

export function updateLiveActivity(progress: number): Promise<void> {
  if (Platform.OS === 'ios') {
    return LiveActivity.update(progress);
  }
  return Promise.resolve();
}

export function stopLiveActivity(immediate = true): Promise<void> {
  if (Platform.OS === 'ios') {
    return LiveActivity.stop(immediate);
  }
  return Promise.resolve();
}
