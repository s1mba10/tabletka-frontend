// Canonical types and a platform-agnostic interface for iOS (HealthKit) and Android (Health Connect)

export type DataType = 'steps' | 'heartRate' | 'activeEnergy' | 'weight' | 'workout';

export type Scope =
  | 'steps.read'
  | 'heartRate.read'
  | 'activeEnergy.read'
  | 'weight.read'
  | 'workout.read'
  | 'weight.write';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BaseSample {
  startDate: string; // ISO
  endDate: string;   // ISO
  source?: string | null;
}

export interface StepSample extends BaseSample {
  value: number;     // count
  unit: 'count';
}

export interface HRSample extends BaseSample {
  value: number;     // bpm
  unit: 'bpm';
}

export interface EnergySample extends BaseSample {
  value: number;     // kcal
  unit: 'kcal';
}

export interface WeightSample extends BaseSample {
  value: number;     // kg
  unit: 'kg';
}

export interface Workout {
  id?: string;
  startDate: string;           // ISO
  endDate: string;             // ISO
  activityType?: string | null;
  totalEnergyBurnedKcal?: number | null;
  totalDistanceKm?: number | null;
  source?: string | null;
}

export type Unsubscribe = () => void;

export interface HealthSource {
  ensurePermissions(scopes: Scope[]): Promise<void>;

  readSteps(range: DateRange): Promise<StepSample[]>;
  readHeartRate(range: DateRange): Promise<HRSample[]>;
  readActiveEnergy(range: DateRange): Promise<EnergySample[]>;
  readWeight(range: DateRange): Promise<WeightSample[]>;
  readWorkouts(range: DateRange): Promise<Workout[]>;

  writeWeight?(valueKg: number, when?: Date): Promise<void>;

  subscribe?(type: DataType, cb: () => void): Unsubscribe; // optional capability
}