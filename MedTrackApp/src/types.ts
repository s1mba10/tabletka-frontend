export type ReminderStatus = 'taken' | 'pending' | 'missed';

export type MedicationType = 'tablet' | 'capsule' | 'liquid' | 'injection';

export type Reminder = {
  id: string;
  name: string;
  dosage: string;
  type: MedicationType;
  time: string;
  status: ReminderStatus;
  date: string; // YYYY-MM-DD format
}
