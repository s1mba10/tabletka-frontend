import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Filter,
  FeGaussianBlur,
  RadialGradient,
  G,
} from 'react-native-svg';
import { addDays, format, parseISO } from 'date-fns';

import { RootStackParamList } from '../../navigation';
import { loadDiary } from '../../nutrition/storage';
import { aggregateMeals } from '../../nutrition/aggregate';
import WeeklyCaloriesCard from './WeeklyCaloriesCard';
import WeeklyMacrosRow from './WeeklyMacrosRow';
import { MealType, NormalizedEntry } from '../../nutrition/types';

const kcalTarget = 3300;
const proteinTarget = 120;
const fatTarget = 80;
const carbsTarget = 300;

const createEmptyDay = (): Record<MealType, NormalizedEntry[]> => ({
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
});

const RingDefs = React.memo(() => (
  <Svg width="0" height="0">
    <Defs>
      <LinearGradient id="gradCalGreen" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#8FFF6A" />
        <Stop offset="100%" stopColor="#39FF14" />
      </LinearGradient>
      <LinearGradient id="gradCalAmber" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FFE082" />
        <Stop offset="100%" stopColor="#FFC107" />
      </LinearGradient>
      <LinearGradient id="gradCalRed" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FF8A80" />
        <Stop offset="100%" stopColor="#FF1744" />
      </LinearGradient>
      <LinearGradient id="gradProtein" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#7CFFE9" />
        <Stop offset="100%" stopColor="#00F5D4" />
      </LinearGradient>
      <LinearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FF80FF" />
        <Stop offset="100%" stopColor="#FF00FF" />
      </LinearGradient>
      <LinearGradient id="gradCarbs" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#7EB3FF" />
        <Stop offset="100%" stopColor="#3D5AFE" />
      </LinearGradient>
      <RadialGradient id="radCal" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(57,255,20,0.10)" />
        <Stop offset="100%" stopColor="rgba(57,255,20,0)" />
      </RadialGradient>
      <RadialGradient id="radProtein" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,245,212,0.10)" />
        <Stop offset="100%" stopColor="rgba(0,245,212,0)" />
      </RadialGradient>
      <RadialGradient id="radFat" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(255,0,255,0.10)" />
        <Stop offset="100%" stopColor="rgba(255,0,255,0)" />
      </RadialGradient>
      <RadialGradient id="radCarbs" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,194,255,0.10)" />
        <Stop offset="100%" stopColor="rgba(0,194,255,0)" />
      </RadialGradient>
      <Filter id="ringBlur" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur stdDeviation="8" />
      </Filter>
    </Defs>
  </Svg>
));

const ProgressRing: React.FC<{
  value: number;
  target?: number | null;
  label: string;
  gradient: string;
  glow: string;
  ambient: string;
}> = React.memo(({ value, target, label, gradient, glow, ambient }) => {
  const size = 120;
  const radius = 48;
  const strokeWidth = 12;
  const glowWidth = strokeWidth + 8;
  const circumference = 2 * Math.PI * radius;

  const rawPct = target && target > 0 ? (value / target) * 100 : null;
  const displayPct = rawPct == null ? '—%' : `${Math.round(rawPct)}%`;
  const p = rawPct == null ? 0 : Math.max(0, Math.min(rawPct, 100)) / 100;
  const offset = circumference * (1 - p);
  const cap = p === 1 ? 'butt' : 'round';

  const accessibilityLabel =
    rawPct === null
      ? `${label}: цель не задана`
      : `${label}: ${Math.round(rawPct)} процента от цели за выбранный день`;

  return (
    <View style={styles.tile} accessibilityLabel={accessibilityLabel}>
      <View style={styles.ringWrap}>
        <Svg
          width={size + 32}
          height={size + 32}
          style={styles.ambientSvg}
        >
          <Circle
            cx={(size + 32) / 2}
            cy={(size + 32) / 2}
            r={(size + 32) / 2}
            fill={`url(#${ambient})`}
          />
        </Svg>
        <Svg width={size} height={size}>
          <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {rawPct !== null && (
              <>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={glow}
                  strokeWidth={glowWidth}
                  strokeLinecap={cap}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  opacity={0.45}
                  filter="url(#ringBlur)"
                />
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={`url(#${gradient})`}
                  strokeWidth={strokeWidth}
                  strokeLinecap={cap}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={2}
                  strokeLinecap={cap}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </>
            )}
          </G>
        </Svg>
        <View style={styles.labelCenter} pointerEvents="none">
          <Text style={styles.percent}>{displayPct}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
});

const NutritionStatsScreen: React.FC<{
  route: RouteProp<RootStackParamList, 'NutritionStats'>;
  navigation: StackNavigationProp<RootStackParamList, 'NutritionStats'>;
}> = ({ route }) => {
  const { selectedDate } = route.params;
  const [entries, setEntries] = useState<
    Record<string, Record<MealType, NormalizedEntry[]>>
  >({});

  useEffect(() => {
    loadDiary().then(data => setEntries(data));
  }, []);

  const dayTotals = useMemo(() => {
    const dayEntries = entries[selectedDate] || createEmptyDay();
    return aggregateMeals(dayEntries).dayTotals;
  }, [entries, selectedDate]);

  const weekDates = useMemo(() => {
    const start = parseISO(selectedDate);
    const monday = addDays(start, -((start.getDay() + 6) % 7));
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(monday, i);
      return format(d, 'yyyy-MM-dd');
    });
  }, [selectedDate]);

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

  const caloriePct = kcalTarget > 0 ? (dayTotals.calories / kcalTarget) * 100 : null;
  let calColors = { gradient: 'gradCalGreen', glow: '#39FF14' };
  if (caloriePct != null) {
    if (caloriePct > 110) calColors = { gradient: 'gradCalRed', glow: '#FF1744' };
    else if (caloriePct > 100)
      calColors = { gradient: 'gradCalAmber', glow: '#FFC107' };
  }

  const cards = [
    {
      key: 'calories',
      label: 'Калории',
      value: dayTotals.calories,
      target: kcalTarget,
      gradient: calColors.gradient,
      glow: calColors.glow,
      ambient: 'radCal',
    },
    {
      key: 'protein',
      label: 'Белки',
      value: dayTotals.protein,
      target: proteinTarget,
      gradient: 'gradProtein',
      glow: '#00F5D4',
      ambient: 'radProtein',
    },
    {
      key: 'fat',
      label: 'Жиры',
      value: dayTotals.fat,
      target: fatTarget,
      gradient: 'gradFat',
      glow: '#FF00FF',
      ambient: 'radFat',
    },
    {
      key: 'carbs',
      label: 'Углеводы',
      value: dayTotals.carbs,
      target: carbsTarget,
      gradient: 'gradCarbs',
      glow: '#00C2FF',
      ambient: 'radCarbs',
    },
  ];

  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dailyData = labels.map((label, i) => ({
    label,
    calories: dailyTotals[i].calories,
    target: kcalTarget,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RingDefs />
      <View style={styles.cardRow}>
        {cards.map(c => (
          <ProgressRing
            key={c.key}
            value={c.value}
            target={c.target}
            label={c.label}
            gradient={c.gradient}
            glow={c.glow}
            ambient={c.ambient}
          />
        ))}
      </View>

      <WeeklyCaloriesCard days={dailyData} />

      <WeeklyMacrosRow totals={weekTotals} kcalTarget={kcalTarget} />
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
  tile: {
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    overflow: 'visible',
  },
  ringWrap: {
    width: 120,
    height: 120,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientSvg: {
    position: 'absolute',
    left: -16,
    top: -16,
    overflow: 'visible',
  },
  labelCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percent: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 4,
  },
});

export default NutritionStatsScreen;

