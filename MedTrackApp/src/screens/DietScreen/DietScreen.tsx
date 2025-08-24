import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Platform, ToastAndroid, Alert } from 'react-native';
import { format } from 'date-fns';

import {
  NutritionCalendar,
  MacronutrientSummary,
  MealPanel,
  AddFoodModal,
} from '../../components';
import type { MealEntry } from '../../components/MealPanel';
import type { MealType, NormalizedEntry } from '../../components/AddFoodModal';
import { styles } from './styles';

const MEAL_TITLES: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус/Другое',
};

const DietScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [modalMeal, setModalMeal] = useState<MealType | null>(null);
  const [mealsEntries, setMealsEntries] = useState<Record<MealType, MealEntry[]>>({
    breakfast: [
      {
        id: '1',
        name: 'Омлет или Яичница',
        amount: '3 яйца',
        calories: 294,
        fat: 21.43,
        carbs: 3.46,
        protein: 20.42,
      },
    ],
    lunch: [],
    dinner: [],
    snack: [],
  });

  const mockFoodDates = new Set([
    '2025-08-18',
    '2025-08-20',
    '2025-08-22',
  ]);

  const mockMacros = {
    caloriesConsumed: 294,
    caloriesTarget: 3300,
    protein: 20.42,
    fat: 21.43,
    carbs: 3.46,
  };

  const dayPercent = mockMacros.caloriesTarget
    ? Math.round((mockMacros.caloriesConsumed / mockMacros.caloriesTarget) * 100)
    : undefined;

  const buildMeal = (type: MealType, icon: string) => {
    const entries = mealsEntries[type];
    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        fat: acc.fat + e.fat,
        carbs: acc.carbs + e.carbs,
        protein: acc.protein + e.protein,
      }),
      { calories: 0, fat: 0, carbs: 0, protein: 0 },
    );
    return {
      key: type,
      title: MEAL_TITLES[type],
      icon,
      totalCalories: totals.calories,
      fat: totals.fat,
      carbs: totals.carbs,
      protein: totals.protein,
      rskPercent: dayPercent,
      entries,
      onAdd: () => setModalMeal(type),
    };
  };

  const meals = [
    buildMeal('breakfast', '🌅'),
    buildMeal('lunch', '☀️'),
    buildMeal('dinner', '🌇'),
    buildMeal('snack', '🌙'),
  ];

  const getHasFoodByDate = (date: string) => mockFoodDates.has(date);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const handleCopyFromYesterday = (date: string) => {
    showToast(`Скопировано из вчера для ${date}`);
  };

  const handleClearDay = (date: string) => {
    showToast(`День ${date} очищен`);
  };

  const handleConfirm = (entry: NormalizedEntry) => {
    setMealsEntries(prev => ({
      ...prev,
      [entry.mealType]: [
        ...prev[entry.mealType],
        {
          id: entry.id,
          name: entry.name || 'Без названия',
          amount: entry.portionGrams ? `${entry.portionGrams} г` : undefined,
          calories: entry.calories,
          fat: entry.fat,
          carbs: entry.carbs,
          protein: entry.protein,
        },
      ],
    }));
    setModalMeal(null);
    showToast(`Добавлено в ${MEAL_TITLES[entry.mealType]}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <NutritionCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          getHasFoodByDate={getHasFoodByDate}
          onCopyFromYesterday={handleCopyFromYesterday}
          onClearDay={handleClearDay}
        />
        <MacronutrientSummary {...mockMacros} />
        {meals.map(({ key, ...meal }) => (
          <MealPanel key={key} {...meal} />
        ))}
      </ScrollView>
      {modalMeal && (
        <AddFoodModal
          mealType={modalMeal}
          onCancel={() => setModalMeal(null)}
          onConfirm={handleConfirm}
        />
      )}
    </SafeAreaView>
  );
};

export default DietScreen;
