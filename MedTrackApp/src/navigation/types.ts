import { Reminder } from '../types';

export type RootStackParamList = {
  Main:
    | {
        updatedReminder?: Reminder;
        newReminder?: Reminder;
        newReminders?: Reminder[];
        forceRefresh?: number;
      }
    | undefined;
  ReminderEdit: {
    reminder: Reminder;
  };
  ReminderAdd: {
    selectedDate?: string;
  };
  Profile: {
    userData?: {
      email: string;
      full_name: string;
      timezone: string;
      is_active: boolean;
      total_taken: number;
      total_missed: number;
      adherence_percentage: number;
    };
  } | undefined;
};