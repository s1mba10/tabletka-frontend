import { Platform } from 'react-native';
import type {
  DateRange, EnergySample, HealthSource, HRSample, StepSample, WeightSample, Workout, Scope, Unsubscribe, DataType,
} from './types';
import { toBpm, toKcal, toKg, toStepsCount } from './units';

type HKLib = any;
let _hk: HKLib | null = null;
function HK(): HKLib {
  if (!_hk) _hk = require('@kingstinct/react-native-healthkit');
  return _hk!;
}

function iso(d: Date) { return d.toISOString(); }

function mapScopes(scopes: Scope[]) {
  const read: string[] = [];
  const write: string[] = [];
  if (scopes.includes('steps.read')) read.push('HKQuantityTypeIdentifierStepCount');
  if (scopes.includes('heartRate.read')) read.push('HKQuantityTypeIdentifierHeartRate');
  if (scopes.includes('activeEnergy.read')) read.push('HKQuantityTypeIdentifierActiveEnergyBurned');
  if (scopes.includes('weight.read') || scopes.includes('weight.write')) read.push('HKQuantityTypeIdentifierBodyMass');
  if (scopes.includes('workout.read')) read.push('HKObjectTypeIdentifierWorkout');
  if (scopes.includes('weight.write')) write.push('HKQuantityTypeIdentifierBodyMass');
  return { read, write };
}

async function ensureIOS() {
  if (Platform.OS !== 'ios') throw new Error('HealthKit is iOS-only');
  const available = await HK().isHealthDataAvailable?.();
  if (!available) throw new Error('HealthKit not available on this device');
}

async function statisticsSumPositional(
  typeId: string,
  startISO: string,
  endISO: string,
  unit: string
): Promise<number | null> {
  const hk = HK();

  if (typeof hk.queryStatisticsForQuantity === 'function') {
    try {
      const res = await hk.queryStatisticsForQuantity(
        typeId,
        ['cumulativeSum'],
        startISO,
        endISO,
        unit
      );
      const sum =
        (res && typeof res.sum === 'number' && res.sum) ??
        (res && typeof res.value === 'number' && res.value) ??
        (typeof res === 'number' ? res : null);
      if (sum != null) return Math.max(0, Math.round(sum));
    } catch {}
  }

  if (typeof hk.queryStatisticsCollectionForQuantity === 'function') {
    try {
      const coll = await hk.queryStatisticsCollectionForQuantity(
        typeId,
        ['cumulativeSum'],
        startISO,
        endISO,
        'day'
      );
      const statsArr = (coll?.statistics ?? coll ?? []) as any[];
      if (Array.isArray(statsArr) && statsArr.length) {
        const sum =
          (typeof statsArr[0]?.sum === 'number' && statsArr[0].sum) ??
          (typeof statsArr[0]?.value === 'number' && statsArr[0].value) ??
          null;
        if (sum != null) return Math.max(0, Math.round(sum));
      }
    } catch {}
  }

  return null;
}

export const healthKitSource: HealthSource & {
  getTodaySteps?: () => Promise<number>;
  __debugMostRecentStepSample?: () => Promise<{ startDate?: string; endDate?: string; value?: number; unit?: string; source?: string } | null>;
} = {
  async ensurePermissions(scopes) {
    await ensureIOS();
    const { read, write } = mapScopes(scopes);
    try {
      await HK().requestAuthorization(read, write);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes('Workout') || msg.includes('SampleTypeIdentifierWriteable')) {
        const readSansWorkout = read.filter(t => t !== 'HKObjectTypeIdentifierWorkout' && t !== 'HKWorkoutType');
        await HK().requestAuthorization(readSansWorkout, write);
      } else {
        throw e;
      }
    }
  },

  async readSteps(range: DateRange): Promise<StepSample[]> {
    await ensureIOS();
    const { samples } = await HK().queryQuantitySamples?.(
      'HKQuantityTypeIdentifierStepCount',
      { startDate: iso(range.start), endDate: iso(range.end) }
    ) ?? { samples: [] };
    return (samples ?? []).map((s: any) => ({
      startDate: s.startDate, endDate: s.endDate,
      value: toStepsCount(s.quantity ?? 0), unit: 'count', source: s.sourceName ?? null,
    }));
  },

  async readHeartRate(range: DateRange): Promise<HRSample[]> {
    await ensureIOS();
    const { samples } = await HK().queryQuantitySamples?.(
      'HKQuantityTypeIdentifierHeartRate',
      { startDate: iso(range.start), endDate: iso(range.end) }
    ) ?? { samples: [] };
    return (samples ?? []).map((s: any) => ({
      startDate: s.startDate, endDate: s.endDate,
      value: toBpm(s.quantity ?? 0), unit: 'bpm', source: s.sourceName ?? null,
    }));
  },

  async readActiveEnergy(range: DateRange): Promise<EnergySample[]> {
    await ensureIOS();
    const { samples } = await HK().queryQuantitySamples?.(
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      { startDate: iso(range.start), endDate: iso(range.end) }
    ) ?? { samples: [] };
    return (samples ?? []).map((s: any) => ({
      startDate: s.startDate, endDate: s.endDate,
      value: toKcal(s.quantity ?? 0), unit: 'kcal', source: s.sourceName ?? null,
    }));
  },

  async readWeight(range: DateRange): Promise<WeightSample[]> {
    await ensureIOS();
    const { samples } = await HK().queryQuantitySamples?.(
      'HKQuantityTypeIdentifierBodyMass',
      { startDate: iso(range.start), endDate: iso(range.end) }
    ) ?? { samples: [] };
    return (samples ?? []).map((s: any) => ({
      startDate: s.startDate, endDate: s.endDate,
      value: toKg(s.quantity ?? 0), unit: 'kg', source: s.sourceName ?? null,
    }));
  },

  async readWorkouts(range: DateRange): Promise<Workout[]> {
    await ensureIOS();
    const api = HK();
    const fn = (api as any).queryWorkoutSamples ?? (api as any).queryWorkouts;
    if (typeof fn !== 'function') return [];
    const { workouts } = await fn({ startDate: iso(range.start), endDate: iso(range.end) });
    return (workouts ?? []).map((w: any) => ({
      id: w.uuid ?? undefined,
      startDate: w.startDate, endDate: w.endDate,
      activityType: w.activityName ?? w.workoutActivityType ?? null,
      totalEnergyBurnedKcal: w.totalEnergyBurned ? toKcal(w.totalEnergyBurned) : null,
      totalDistanceKm: typeof w.totalDistance === 'number' ? Math.round(w.totalDistance * 1000) / 1000 : null,
      source: w.sourceName ?? null,
    }));
  },

  async writeWeight(valueKg: number, when: Date = new Date()) {
    await ensureIOS();
    await HK().saveQuantitySample?.(
      'HKQuantityTypeIdentifierBodyMass',
      toKg(valueKg),
      { startDate: iso(when), endDate: iso(when) }
    );
  },

  subscribe(type: DataType, cb: () => void): Unsubscribe {
    const api = HK();
    const map: Record<DataType, string | null> = {
      steps: 'HKQuantityTypeIdentifierStepCount',
      heartRate: 'HKQuantityTypeIdentifierHeartRate',
      activeEnergy: 'HKQuantityTypeIdentifierActiveEnergyBurned',
      weight: 'HKQuantityTypeIdentifierBodyMass',
      workout: 'HKObjectTypeIdentifierWorkout',
    };
    const hkType = map[type];
    if (!hkType || typeof api.subscribeToChanges !== 'function') return () => {};
    const unsub = api.subscribeToChanges(hkType, cb);
    return () => { try { unsub && unsub(); } catch {} };
  },

  async getTodaySteps() {
    await ensureIOS();
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    const stat = await statisticsSumPositional('HKQuantityTypeIdentifierStepCount', startISO, endISO, 'count');
    if (stat != null) return stat;

    const hk = HK();
    const { samples } = await hk.queryQuantitySamples?.(
      'HKQuantityTypeIdentifierStepCount',
      { startDate: startISO, endDate: endISO }
    ) ?? { samples: [] };
    const total = (samples ?? []).reduce((sum: number, s: any) => sum + (s.quantity ?? 0), 0);
    return Math.max(0, Math.round(total));
  },

  async __debugMostRecentStepSample() {
    await ensureIOS();
    const hk = HK();
    if (typeof hk.getMostRecentQuantitySample !== 'function') return null;
    try {
      const res = await hk.getMostRecentQuantitySample('HKQuantityTypeIdentifierStepCount');
      if (!res) return null;
      return {
        startDate: res.startDate, endDate: res.endDate,
        value: typeof res.quantity === 'number' ? res.quantity : undefined,
        unit: res.unit, source: res.sourceName,
      };
    } catch { return null; }
  },
};