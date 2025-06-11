import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REMINDERS_ENDPOINT } from '../api';
import { Reminder } from '../types';

const PENDING_KEY = 'pendingReminders';
const STORAGE_KEY = 'reminders';

async function mergeWithStorage(key: string, reminders: Reminder[]) {
  const stored = await AsyncStorage.getItem(key);
  const existing: Reminder[] = stored ? JSON.parse(stored) : [];
  await AsyncStorage.setItem(key, JSON.stringify([...existing, ...reminders]));
}

export default function useReminders() {
  const scheduleReminders = useCallback(async (reminders: Reminder[]) => {
    await mergeWithStorage(STORAGE_KEY, reminders);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const tokenType = (await AsyncStorage.getItem('tokenType')) || 'Bearer';
      if (!token) {
        throw new Error('No auth token');
      }

      const response = await fetch(`${REMINDERS_ENDPOINT}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify({ reminders }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to schedule reminders remotely:', error);
      await mergeWithStorage(PENDING_KEY, reminders);
    }
  }, []);

  const syncLocal = useCallback(async () => {
    try {
      const pendingJSON = await AsyncStorage.getItem(PENDING_KEY);
      const pending: Reminder[] = pendingJSON ? JSON.parse(pendingJSON) : [];
      if (!pending.length) return;

      const token = await AsyncStorage.getItem('authToken');
      const tokenType = (await AsyncStorage.getItem('tokenType')) || 'Bearer';
      if (!token) return;

      const response = await fetch(`${REMINDERS_ENDPOINT}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify({ reminders: pending }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      await AsyncStorage.removeItem(PENDING_KEY);
    } catch (error) {
      console.error('Failed to sync local reminders:', error);
    }
  }, []);

  return { scheduleReminders, syncLocal };
}
