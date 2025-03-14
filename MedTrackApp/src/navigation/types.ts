export type Reminder = {
  id: string;
  name: string;
  dosage: string;
  type: 'tablet' | 'capsule' | 'liquid' | 'injection';
  time: string;
  status: 'taken' | 'pending' | 'missed';
  date: string;
};

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
};
