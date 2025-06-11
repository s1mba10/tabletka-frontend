import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, put, del } from '../api';
import { Reminder, ReminderStatus } from '../types';
import { reminderNotification } from '../utils/notifications';

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
    if (!items.length) return;

    const first = items[0];

    const medication = await post('/medications/', {
      name: first.name,
      dosage: first.dosage,
      description: '',
    });

    const payload = {
      medication_id: medication.id,
      selected_dates: Array.from(new Set(items.map((r) => r.date))),
      selected_times: Array.from(new Set(items.map((r) => r.time))),
      note: '',
    };

    await post('/reminders/schedule/', payload);

    setReminders((prev) => {
      const all = [...prev, ...items];
      AsyncStorage.setItem('reminders', JSON.stringify(all));
      items.forEach((reminder) => {
        const [hour, minute] = reminder.time.split(':').map(Number);
        const notificationDate = new Date(reminder.date);
        notificationDate.setHours(hour, minute, 0, 0);
        if (notificationDate > new Date()) {
          reminderNotification({
            title: `Напоминание: ${reminder.name}`,
            body: `Примите ${reminder.dosage}`,
            date: notificationDate,
          });
        }
      });
      return all;
    });
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
