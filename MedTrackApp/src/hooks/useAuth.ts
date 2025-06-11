import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post, get } from '../api';
import { useReminders } from './useReminders';

interface Credentials {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserProfile {
  email: string;
  full_name: string;
  timezone: string;
  is_active: boolean;
  total_taken: number;
  total_missed: number;
  adherence_percentage: number;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { scheduleReminders } = useReminders();

  const authenticate = async (creds: Credentials) => {
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const data = await post('/auth/', { ...creds, timezone });
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('tokenType', data.token_type || 'Bearer');
      await syncLocalReminders();
      const user: UserProfile = await get('/users/me');
      return user;
    } finally {
      setLoading(false);
    }
  };

  const login = (email: string, password: string) =>
    authenticate({ email, password });

  const register = (email: string, password: string, full_name: string) =>
    authenticate({ email, password, full_name });

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('tokenType');
  };

  const syncLocalReminders = async () => {
    const stored = await AsyncStorage.getItem('reminders');
    if (!stored) return;
    try {
      const reminders = JSON.parse(stored);
      if (Array.isArray(reminders) && reminders.length > 0) {
        await scheduleReminders(reminders);
        await AsyncStorage.removeItem('reminders');
      }
    } catch (e) {
      console.warn('Failed to sync reminders', e);
    }
  };

  return { login, register, logout, loading };
};
