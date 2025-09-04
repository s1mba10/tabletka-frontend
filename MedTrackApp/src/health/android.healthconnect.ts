// Android implementation via Health Connect (lazy require)

import { Platform } from 'react-native';
import type {
  DateRange,
  EnergySample,
  HealthSource,
  HRSample,
  StepSample,
  WeightSample,
  Workout,
  Scope,
  Unsubscribe,
  DataType,
} from './types';
import { toBpm, toKcal, toKg, toStepsCount } from './units';

type HCLib = any;
let _hc: HCLib | null = null;
function HC(): HCLib {
  if (!_hc) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _hc = require('react-native-health-connect');
  }
  return _hc!;
}

function iso(d: Date): string {
  return d.toISOString();
}

function guardAndroid() {
  if (Platform.OS !== 'android') throw new Error('Health Connect is Android-only');
}

function permissionsFromScopes(scopes: Scope[]) {
  const perms: Array<{ accessType: 'read' | 'write'; recordType: string }> = [];
  if (scopes.includes('steps.read')) perms.push({ accessType: 'read', recordType: 'StepCountRecord' });
  if (scopes.includes('heartRate.read')) perms.push({ accessType: 'read', recordType: 'HeartRateRecord' });
  if (scopes.includes('activeEnergy.read')) perms.push({ accessType: 'read', recordType: 'ActiveCaloriesBurnedRecord' });
  if (scopes.includes('weight.read')) perms.push({ accessType: 'read', recordType: 'WeightRecord' });
  if (scopes.includes('workout.read')) perms.push({ accessType: 'read', recordType: 'ExerciseSessionRecord' });
  if (scopes.includes('weight.write')) perms.push({ accessType: 'write', recordType: 'WeightRecord' });
  return perms;
}

export const healthConnectSource: HealthSource = {
  async ensurePermissions(scopes) {
    guardAndroid();
    const api = HC();
    if (typeof api.initialize === 'function') {
      await api.initialize();
    }
    if (typeof api.isAvailable === 'function') {
      const available = await api.isAvailable();
      if (!available) throw new Error('Health Connect is not available on this device');
    }
    const perms = permissionsFromScopes(scopes);
    if (typeof api.requestPermission === 'function') {
      await api.requestPermission(perms);
    } else if (typeof api.requestPermissions === 'function') {
      await api.requestPermissions(perms);
    }
  },

  async readSteps(range: DateRange): Promise<StepSample[]> {
    guardAndroid();
    const api = HC();
    if (!api.readRecords) return [];
    const result = await api.readRecords('StepCountRecord', {
      timeRangeFilter: { startTime: iso(range.start), endTime: iso(range.end) },
    });
    const items = (result?.records ?? result ?? []) as any[];
    return items.map((r: any) => ({
      startDate: r.startTime ?? r.startDateTime ?? r.startDate,
      endDate: r.endTime ?? r.endDateTime ?? r.endDate,
      value: toStepsCount(r.count ?? r.steps ?? 0),
      unit: 'count',
      source: r.metadata?.dataOrigin?.packageName ?? null,
    }));
  },

  async readHeartRate(range: DateRange): Promise<HRSample[]> {
    guardAndroid();
    const api = HC();
    if (!api.readRecords) return [];
    const result = await api.readRecords('HeartRateRecord', {
      timeRangeFilter: { startTime: iso(range.start), endTime: iso(range.end) },
    });
    const items = (result?.records ?? result ?? []) as any[];
    const flat: HRSample[] = [];
    for (const r of items) {
      const series = r.samples ?? r.heartRateSamples ?? [];
      for (const s of series) {
        flat.push({
          startDate: s.time ?? s.startTime ?? r.startTime,
          endDate: s.time ?? s.endTime ?? r.endTime,
          value: toBpm(s.beatsPerMinute ?? s.bpm ?? 0),
          unit: 'bpm',
          source: r.metadata?.dataOrigin?.packageName ?? null,
        });
      }
    }
    return flat;
  },

  async readActiveEnergy(range: DateRange): Promise<EnergySample[]> {
    guardAndroid();
    const api = HC();
    if (!api.readRecords) return [];
    const result = await api.readRecords('ActiveCaloriesBurnedRecord', {
      timeRangeFilter: { startTime: iso(range.start), endTime: iso(range.end) },
    });
    const items = (result?.records ?? result ?? []) as any[];
    return items.map((r: any) => ({
      startDate: r.startTime ?? r.startDate,
      endDate: r.endTime ?? r.endDate,
      value: toKcal(r.energy?.inKilocalories ?? r.energyKcal ?? r.energy ?? 0),
      unit: 'kcal',
      source: r.metadata?.dataOrigin?.packageName ?? null,
    }));
  },

  async readWeight(range: DateRange): Promise<WeightSample[]> {
    guardAndroid();
    const api = HC();
    if (!api.readRecords) return [];
    const result = await api.readRecords('WeightRecord', {
      timeRangeFilter: { startTime: iso(range.start), endTime: iso(range.end) },
    });
    const items = (result?.records ?? result ?? []) as any[];
    return items.map((r: any) => ({
      startDate: r.time ?? r.startTime ?? r.startDate,
      endDate: r.time ?? r.endTime ?? r.endDate,
      value: toKg(r.weight?.inKilograms ?? r.weightKg ?? r.weight ?? 0),
      unit: 'kg',
      source: r.metadata?.dataOrigin?.packageName ?? null,
    }));
  },

  async readWorkouts(range: DateRange): Promise<Workout[]> {
    guardAndroid();
    const api = HC();
    if (!api.readRecords) return [];
    const result = await api.readRecords('ExerciseSessionRecord', {
      timeRangeFilter: { startTime: iso(range.start), endTime: iso(range.end) },
    });
    const items = (result?.records ?? result ?? []) as any[];
    return items.map((r: any) => ({
      id: r.metadata?.id ?? undefined,
      startDate: r.startTime ?? r.startDate,
      endDate: r.endTime ?? r.endDate,
      activityType: r.exerciseType ?? r.activityType ?? null,
      totalEnergyBurnedKcal: r.activeCalories?.inKilocalories ?? r.activeKcal ?? null,
      totalDistanceKm:
        typeof r.distance?.inKilometers === 'number' ? r.distance.inKilometers :
        typeof r.distanceKm === 'number' ? r.distanceKm : null,
      source: r.metadata?.dataOrigin?.packageName ?? null,
    }));
  },

  async writeWeight(valueKg: number, when: Date = new Date()) {
    guardAndroid();
    const api = HC();
    if (!api.insertRecords && !api.writeRecords) {
      throw new Error('Health Connect write API not available');
    }
    const record = {
      recordType: 'WeightRecord',
      time: iso(when),
      weight: { inKilograms: toKg(valueKg) },
    };
    if (api.insertRecords) {
      await api.insertRecords([record]);
    } else {
      await api.writeRecords([record]);
    }
  },

  subscribe(_type: DataType, _cb: () => void): Unsubscribe {
    // Health Connect doesn't push live events like HealthKit; keep a no-op
    return () => {};
  },
};