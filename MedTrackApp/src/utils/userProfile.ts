import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

export interface UserProfile {
  full_name: string;
  email: string;
  timezone: string;
  is_active: boolean;
  total_taken: number;
  total_missed: number;
  adherence_percentage: number;
}

const KEY = 'userProfile';

export const loadProfile = async (): Promise<UserProfile | null> => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = async (profile: UserProfile) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
};

export const updateStats = async (reminders: Reminder[]) => {
  const total_taken = reminders.filter(r => r.status === 'taken').length;
  const total_missed = reminders.filter(r => r.status === 'missed').length;
  const total = total_taken + total_missed;
  const adherence_percentage = total ? (total_taken / total) * 100 : 0;
  const profile = (await loadProfile()) || {
    full_name: 'User Name',
    email: 'user@example.com',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_active: true,
    total_taken: 0,
    total_missed: 0,
    adherence_percentage: 0,
  };
  const updated = {
    ...profile,
    total_taken,
    total_missed,
    adherence_percentage,
  };
  await saveProfile(updated);
  return updated;
};

