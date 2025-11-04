import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MedicationCourse, Reminder } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { loadArrayFromStorage } from '../utils/asyncStorageUtils';

interface CoursesContextValue {
  courses: MedicationCourse[];
  loading: boolean;
  fetchCourses: () => Promise<void>;
  saveCourse: (course: MedicationCourse) => Promise<void>;
  updateCourse: (id: number, payload: Partial<MedicationCourse>) => Promise<void>;
  removeCourse: (id: number) => Promise<void>;
}

const CoursesContext = createContext<CoursesContextValue | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<MedicationCourse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await loadArrayFromStorage<MedicationCourse>(STORAGE_KEYS.COURSES);
      setCourses(data);
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async (items: MedicationCourse[]) => {
    setCourses(items);
    await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(items));
  };

  const saveCourse = async (course: MedicationCourse) => {
    await saveAll([...courses, course]);
  };

  const updateCourse = async (id: number, payload: Partial<MedicationCourse>) => {
    const updated = courses.map(c => (c.id === id ? { ...c, ...payload } : c));
    await saveAll(updated);
  };

  const removeCourse = async (id: number) => {
    try {
      // Load both courses and reminders atomically
      const [[, coursesRaw], [, remindersRaw]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.COURSES,
        STORAGE_KEYS.REMINDERS,
      ]);

      // Parse courses
      const storedCourses = coursesRaw ? JSON.parse(coursesRaw) : [];
      const filteredCourses = Array.isArray(storedCourses)
        ? storedCourses.filter((c: MedicationCourse) => c.id !== id)
        : [];

      // Parse reminders
      const storedReminders = remindersRaw ? JSON.parse(remindersRaw) : [];
      const filteredReminders = Array.isArray(storedReminders)
        ? storedReminders.filter((r: Reminder) => r.courseId !== id)
        : [];

      // Save both atomically
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.COURSES, JSON.stringify(filteredCourses)],
        [STORAGE_KEYS.REMINDERS, JSON.stringify(filteredReminders)],
      ]);

      // Update state only after successful storage
      setCourses(filteredCourses);
    } catch (e) {
      console.error('Failed to remove course and reminders for id', id, e);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <CoursesContext.Provider
      value={{ courses, loading, fetchCourses, saveCourse, updateCourse, removeCourse }}
    >
      {children}
    </CoursesContext.Provider>
  );
};

export const useCourses = () => {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error('useCourses must be used within CoursesProvider');
  return ctx;
};
