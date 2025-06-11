import { useState, useEffect } from 'react';
import { get } from '../api';

export interface CalendarEntry {
  date: string;
  reminders: any[];
  medications: any[];
}

export const useCalendar = (startDate: string, endDate: string) => {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const data = await get(`/calendar/?start_date=${startDate}&end_date=${endDate}`);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [startDate, endDate]);

  return { entries, loading, refresh: fetchCalendar };
};
