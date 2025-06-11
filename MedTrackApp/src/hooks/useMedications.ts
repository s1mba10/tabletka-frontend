import { useState, useEffect } from 'react';
import { get, post, put, del } from '../api';
import { Medication } from '../types';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const data: Medication[] = await get('/medications/');
      setMedications(data);
    } finally {
      setLoading(false);
    }
  };

  const createMedication = async (payload: Partial<Medication>) => {
    const med: Medication = await post('/medications/', payload);
    setMedications((prev) => [...prev, med]);
    return med;
  };

  const updateMedication = async (id: number, payload: Partial<Medication>) => {
    const med: Medication = await put(`/medications/${id}`, payload);
    setMedications((prev) => prev.map((m) => (m.id === id ? med : m)));
    return med;
  };

  const removeMedication = async (id: number) => {
    await del(`/medications/${id}`);
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return { medications, loading, fetchMedications, createMedication, updateMedication, removeMedication };
};
