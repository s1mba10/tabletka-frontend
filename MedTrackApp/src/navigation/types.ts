import { Reminder } from '../types';
import { MealType } from '../nutrition/types';

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
  FoodEdit: {
    date: string;
    meal: MealType;
    entryId: string;
  };
};
