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
  Profile: undefined;
  Medications: undefined;
};
