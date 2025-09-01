import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';

import { RootStackParamList } from '../../navigation';
import { loadDiary } from '../../nutrition/storage';
import { aggregateMeals } from '../../nutrition/aggregate';
import { formatNumber } from '../../utils/number';
import WeeklyCaloriesCard from './WeeklyCaloriesCard';
import MacroRing from './MacroRing';

import { MealType, NormalizedEntry } from '../../nutrition/types';

type RouteProps = RouteProp<RootStackParamList, 'NutritionStats'>;

const targetCalories = 3300;
const targetProtein = 120;
const targetFat = 80;
const targetCarbs = 300;

const createEmptyDay = (): Record<MealType, NormalizedEntry[]> => ({
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
});

const NutritionStatsScreen: React.FC<{ route: RouteProps }> = ({ route }) => {
  const { selectedDate } = route.params;
  const [entries, setEntries] = useState<Record<string, Record<MealType, NormalizedEntry[]>>>({});

  useEffect(() => {
    loadDiary().then(data => setEntries(data));
  }, []);

  const weekDates = useMemo(() => {
    const start = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i);
      return format(d, 'yyyy-MM-dd');
    });
  }, [selectedDate]);

  const dailyTotals = weekDates.map(date => {
    const dayEntries = entries[date] || createEmptyDay();
    return aggregateMeals(dayEntries).dayTotals;
  });

  const selectedDayTotals = useMemo(() => {
    const dayEntries = entries[selectedDate] || createEmptyDay();
    return aggregateMeals(dayEntries).dayTotals;
  }, [entries, selectedDate]);

  const weekTotals = dailyTotals.reduce(
    (sum, d) => ({
      calories: sum.calories + d.calories,
      protein: sum.protein + d.protein,
      fat: sum.fat + d.fat,
      carbs: sum.carbs + d.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  const cards = [
    {
      label: 'Калории',
      type: 'calories' as const,
      consumed: selectedDayTotals.calories,
      target: targetCalories,
    },
    {
      label: 'Белки',
      type: 'protein' as const,
      consumed: selectedDayTotals.protein,
      target: targetProtein,
    },
    {
      label: 'Жиры',
      type: 'fat' as const,
      consumed: selectedDayTotals.fat,
      target: targetFat,
    },
    {
      label: 'Углеводы',
      type: 'carbs' as const,
      consumed: selectedDayTotals.carbs,
      target: targetCarbs,
    },
  ];

  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dailyData = labels.map((label, i) => ({
    label,
    calories: dailyTotals[i]?.calories ?? 0,
    target: targetCalories,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardRow}>
        {cards.map(c => (
          <MacroRing
            key={c.label}
            label={c.label}
            consumed={c.consumed}
            target={c.target}
            type={c.type}
          />
        ))}
      </View>

      <WeeklyCaloriesCard days={dailyData} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>За неделю</Text>
          <Text style={styles.summaryValue}>
            {formatNumber(weekTotals.calories)} ккал, {formatNumber(weekTotals.protein)} Б, {formatNumber(weekTotals.fat)} Ж, {formatNumber(weekTotals.carbs)} У
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Отклонение от цели</Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color:
                  weekTotals.calories - targetCalories * 7 >= 0 ? '#EF4444' : '#22C55E',
              },
            ]}
          >
            {formatNumber(weekTotals.calories - targetCalories * 7)} ккал
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 20,
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NutritionStatsScreen;
