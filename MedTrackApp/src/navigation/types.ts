import { Reminder } from '../types';
import { NormalizedEntry } from '../nutrition/types';

export type RootStackParamList = {
  MainScreen: undefined;
  Account: undefined;
  MedCalendar:
    | {
        updatedReminder?: Reminder;
        newReminder?: Reminder;
        newReminders?: Reminder[];
        forceRefresh?: number;
      }
    | undefined;
  ReminderEdit: {
    reminder: Reminder;
    mainKey?: string;
  };
  ReminderAdd: {
    selectedDate?: string;
    mainKey?: string;
    course?: import('../types').MedicationCourse;
  };
  Profile: undefined;
  Medications: undefined;
  BodyDiary: undefined;
  Diet: undefined;
  FoodEdit: { entry: NormalizedEntry; onSave: (entry: NormalizedEntry) => void };
};
