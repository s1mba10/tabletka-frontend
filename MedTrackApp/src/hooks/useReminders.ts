import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, put, del } from '../api';
import { Reminder, ReminderStatus } from '../types';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const data: Reminder[] = await get('/reminders/');
      setReminders(data);
    } finally {
      setLoading(false);
    }
  };

  const scheduleReminders = async (items: Reminder[]) => {
    await post('/reminders/schedule/', { reminders: items });
    setReminders((prev) => [...prev, ...items]);
  };

  const updateReminderStatus = async (id: string | number, status: ReminderStatus) => {
    const updated: Reminder = await put(`/reminders/${id}/status`, { status });
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteReminder = async (id: string | number) => {
    await del(`/reminders/${id}`);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const syncLocal = async () => {
    const stored = await AsyncStorage.getItem('reminders');
    if (!stored) return;
    try {
      const local: Reminder[] = JSON.parse(stored);
      if (local.length) {
        await scheduleReminders(local);
        await AsyncStorage.removeItem('reminders');
      }
    } catch (e) {
      console.warn('Failed to sync local reminders', e);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return { reminders, loading, fetchReminders, scheduleReminders, updateReminderStatus, deleteReminder, syncLocal };
};
