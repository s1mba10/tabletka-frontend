// Single entry for UI: returns the platform-specific implementation.

import { Platform } from 'react-native';
import type { HealthSource } from './types';

let cached: HealthSource | null = null;

export function getHealthSource(): HealthSource {
  if (cached) return cached;

  if (Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cached = require('./ios.healthkit').healthKitSource as HealthSource;
  } else if (Platform.OS === 'android') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cached = require('./android.healthconnect').healthConnectSource as HealthSource;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cached = require('./stub').stubSource as HealthSource;
  }
  return cached!;
}

export * from './types';
import * as UnitsNS from './units';
export { UnitsNS as Units };