import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Platform, ToastAndroid, Alert } from 'react-native';
import { format } from 'date-fns';

import { NutritionCalendar, MacronutrientSummary, MealPanel } from '../../components';
import AddFoodModal from '../../components/AddFoodModal';
import { MealType, NormalizedEntry } from '../../nutrition/types';
import { styles } from './styles';

const DietScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );

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

  const initialMeals = [
    {
      key: 'breakfast',
      title: 'Завтрак',
      icon: '🌅',
      totalCalories: 294,
      fat: 21.43,
      carbs: 3.46,
      protein: 20.42,
      rskPercent: dayPercent,
      entries: [
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
    },
    {
      key: 'lunch',
      title: 'Обед',
      icon: '☀️',
      totalCalories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
      rskPercent: dayPercent,
      entries: [],
    },
    {
      key: 'dinner',
      title: 'Ужин',
      icon: '🌇',
      totalCalories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
      rskPercent: dayPercent,
      entries: [],
    },
    {
      key: 'snack',
      title: 'Перекус/Другое',
      icon: '🌙',
      totalCalories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
      rskPercent: dayPercent,
      entries: [],
    },
  ];

  const [meals, setMeals] = useState(initialMeals);
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);

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
    setMeals(prev =>
      prev.map(meal =>
        meal.key === entry.mealType
          ? {
              ...meal,
              totalCalories: meal.totalCalories + entry.calories,
              fat: meal.fat + entry.fat,
              carbs: meal.carbs + entry.carbs,
              protein: meal.protein + entry.protein,
              entries: [
                ...meal.entries,
                {
                  id: entry.id,
                  name: entry.name || '',
                  amount: entry.portionGrams
                    ? `${entry.portionGrams} г`
                    : undefined,
                  calories: entry.calories,
                  fat: entry.fat,
                  carbs: entry.carbs,
                  protein: entry.protein,
                },
              ],
            }
          : meal,
      ),
    );
    setActiveMeal(null);
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
          <MealPanel key={key} {...meal} onAdd={() => setActiveMeal(key as MealType)} />
        ))}
      </ScrollView>
      {activeMeal && (
        <AddFoodModal
          mealType={activeMeal}
          onCancel={() => setActiveMeal(null)}
          onConfirm={handleConfirm}
        />
      )}
    </SafeAreaView>
  );
};

export default DietScreen;

