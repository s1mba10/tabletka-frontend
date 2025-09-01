import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Circle } from 'react-native-svg';
import { addDays, format, parseISO } from 'date-fns';

import { RootStackParamList } from '../../navigation';
import { loadDiary } from '../../nutrition/storage';
import { aggregateMeals } from '../../nutrition/aggregate';
import { formatNumber } from '../../utils/number';
import WeeklyCaloriesCard from './WeeklyCaloriesCard';

import { MealType, NormalizedEntry } from '../../nutrition/types';

type RouteProps = RouteProp<RootStackParamList, 'NutritionStats'>;
type NavProps = StackNavigationProp<RootStackParamList, 'NutritionStats'>;

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

const NeonCircle: React.FC<{
  percent: number;
  label: string;
  consumed: number;
  target: number;
  color: string;
}> = ({ percent, label, consumed, target, color }) => {
  const radius = 40;
  const strokeWidth = 8;
  const normalizedPercent = Math.min(percent, 100);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedPercent / 100) * circumference;
  const pctLabel = `${Math.round(percent)}%`;

  return (
    <View style={[styles.card, { shadowColor: color }]}> 
      <Svg width={radius * 2} height={radius * 2}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={styles.circleContent}>
        <Text style={styles.circlePercent}>{pctLabel}</Text>
        <Text style={styles.circleLabel}>{label}</Text>
        <Text style={styles.circleSub}>{`${formatNumber(consumed)}/${formatNumber(target)}${label === 'Калории' ? ' ккал' : ' г'}`}</Text>
      </View>
    </View>
  );
};

const NutritionStatsScreen: React.FC<{ route: RouteProps; navigation: NavProps }> = ({ route }) => {
  const { weekStart } = route.params;
  const [entries, setEntries] = useState<Record<string, Record<MealType, NormalizedEntry[]>>>({});

  useEffect(() => {
    loadDiary().then(data => setEntries(data));
  }, []);

  const weekDates = useMemo(() => {
    const start = parseISO(weekStart);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i);
      return format(d, 'yyyy-MM-dd');
    });
  }, [weekStart]);

  const dailyTotals = weekDates.map(date => {
    const dayEntries = entries[date] || createEmptyDay();
    return aggregateMeals(dayEntries).dayTotals;
  });

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
      color: '#FFC107',
      consumed: weekTotals.calories,
      target: targetCalories * 7,
      percent: (weekTotals.calories / (targetCalories * 7)) * 100,
    },
    {
      label: 'Белки',
      color: '#22C55E',
      consumed: weekTotals.protein,
      target: targetProtein * 7,
      percent: (weekTotals.protein / (targetProtein * 7)) * 100,
    },
    {
      label: 'Жиры',
      color: '#EF4444',
      consumed: weekTotals.fat,
      target: targetFat * 7,
      percent: (weekTotals.fat / (targetFat * 7)) * 100,
    },
    {
      label: 'Углеводы',
      color: '#3B82F6',
      consumed: weekTotals.carbs,
      target: targetCarbs * 7,
      percent: (weekTotals.carbs / (targetCarbs * 7)) * 100,
    },
  ];

  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dailyData = labels.map((label, i) => ({
    label,
    calories: dailyTotals[i].calories,
    target: targetCalories,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardRow}>
        {cards.map(c => (
          <NeonCircle
            key={c.label}
            percent={c.percent}
            label={c.label}
            consumed={c.consumed}
            target={c.target}
            color={c.color}
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
  card: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 16,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circlePercent: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  circleLabel: {
    color: '#fff',
    marginTop: 4,
    fontSize: 14,
  },
  circleSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: '#555',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
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
