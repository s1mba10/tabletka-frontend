import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { format } from 'date-fns';

import {
  NutritionCalendar,
  MacronutrientSummary,
  MealPanel,
} from '../../components';
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

  const meals = [
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

  const getHasFoodByDate = (date: string) => mockFoodDates.has(date);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <NutritionCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          getHasFoodByDate={getHasFoodByDate}
        />
        <MacronutrientSummary {...mockMacros} />
        {meals.map(meal => (
          <MealPanel key={meal.key} {...meal} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DietScreen;

