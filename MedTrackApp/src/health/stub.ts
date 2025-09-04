// Safe no-op stub for unsupported platforms (e.g., web) or early dev stage.

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

export const stubSource: HealthSource = {
  async ensurePermissions(_scopes: Scope[]) {},
  async readSteps(_range: DateRange): Promise<StepSample[]> { return []; },
  async readHeartRate(_range: DateRange): Promise<HRSample[]> { return []; },
  async readActiveEnergy(_range: DateRange): Promise<EnergySample[]> { return []; },
  async readWeight(_range: DateRange): Promise<WeightSample[]> { return []; },
  async readWorkouts(_range: DateRange): Promise<Workout[]> { return []; },
  async writeWeight(_valueKg: number, _when?: Date) {},
  subscribe(_type: DataType, _cb: () => void): Unsubscribe { return () => {}; },
};