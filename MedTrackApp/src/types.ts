export type ReminderStatus = 'taken' | 'pending' | 'missed';

export const MedicationType = {
  Tablet: 'tablet',
  Capsule: 'capsule',
  Liquid: 'liquid',
  Injection: 'injection',
  Other: 'other',
} as const;

export type MedicationType = (typeof MedicationType)[keyof typeof MedicationType];
export type Reminder = {
  id: string;
  name: string;
  dosage: string;
  type: MedicationType;
  time: string;
  status: ReminderStatus;
  date: string; // YYYY-MM-DD format
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  description: string;
  created_at: string;
}

export interface ReminderResponse {
  id: number;
  medication_id: number;
  date: string;
  time: string;
  note: string;
  status: ReminderStatus;
}