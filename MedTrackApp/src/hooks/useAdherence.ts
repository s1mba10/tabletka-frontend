import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

export const useAdherence = () => {
  const [percentage, setPercentage] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('reminders');
      if (stored) {
        const items: Reminder[] = JSON.parse(stored);
        const totalTaken = items.filter(r => r.status === 'taken').length;
        const totalMissed = items.filter(r => r.status === 'missed').length;
        const total = totalTaken + totalMissed;
        const calc = total > 0 ? (totalTaken / total) * 100 : 0;
        setPercentage(calc);
      } else {
        setPercentage(0);
      }
    } catch (e) {
      console.warn('Failed to load stats', e);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { percentage, reloadStats: loadStats };
};
