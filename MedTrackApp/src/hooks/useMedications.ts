import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication } from '../types';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('medications');
      if (stored) {
        setMedications(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveMedications = async (items: Medication[]) => {
    setMedications(items);
    await AsyncStorage.setItem('medications', JSON.stringify(items));
  };

  const createMedication = async (payload: Partial<Medication>) => {
    const med: Medication = {
      id: Date.now(),
      name: payload.name || '',
      dosage: payload.dosage || '',
      description: payload.description || '',
      created_at: new Date().toISOString(),
    };
    await saveMedications([...medications, med]);
    return med;
  };

  const updateMedication = async (id: number, payload: Partial<Medication>) => {
    const updated = medications.map(m =>
      m.id === id ? { ...m, ...payload } : m
    );
    await saveMedications(updated);
    return updated.find(m => m.id === id)!;
  };

  const removeMedication = async (id: number) => {
    const filtered = medications.filter(m => m.id !== id);
    await saveMedications(filtered);
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return {
    medications,
    loading,
    fetchMedications,
    createMedication,
    updateMedication,
    removeMedication,
  };
};
