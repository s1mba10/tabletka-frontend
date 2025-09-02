// screens/nutrition/NutritionStatsScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  AccessibilityInfo,
  Animated,
  Easing,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Filter,
  FeGaussianBlur,
} from 'react-native-svg';
import { addDays, format, parseISO } from 'date-fns';

import { RootStackParamList } from '../../navigation';
import { loadDiary } from '../../nutrition/storage';
import { aggregateMeals } from '../../nutrition/aggregate';
import WeeklyCaloriesCard from './WeeklyCaloriesCard';
import WeeklyMacrosRow from './WeeklyMacrosRow';
import { MealType, NormalizedEntry } from '../../nutrition/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// targets (mock)
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

/**
 * Neon gradients + blur filter
 * (Made a bit brighter vs previous version)
 */
const RingDefs = React.memo(() => (
  <Svg width="0" height="0">
    <Defs>
      {/* Neon-leaning gradients (used only as optional sheen) */}
      <LinearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#39FF14" />
        <Stop offset="100%" stopColor="#22C55E" />
      </LinearGradient>
      <LinearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FFD54F" />
        <Stop offset="100%" stopColor="#FFC107" />
      </LinearGradient>
      <LinearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FF6B6B" />
        <Stop offset="100%" stopColor="#FF2D55" />
      </LinearGradient>
      <LinearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#4FC3FF" />
        <Stop offset="100%" stopColor="#3B82F6" />
      </LinearGradient>

      {/* Soft glow */}
      <Filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur stdDeviation="9" />
      </Filter>
    </Defs>
  </Svg>
));

/**
 * Single neon progress ring (now uses a vivid solid “crisp” arc,
 * plus two glow passes underneath to avoid the “dim” look).
 */
const ProgressRing: React.FC<{
  value: number;
  target?: number | null;
  label: string;
  gradient: string; // kept for subtle sheen (optional)
  glow: string;     // also used as crispColor for non-calorie rings
}> = React.memo(({ value, target, label, gradient, glow }) => {
  const size = 120;
  const radius = 48;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  const rawPct = target && target > 0 ? (value / target) * 100 : null;
  const displayPct = rawPct == null ? '—%' : `${Math.round(rawPct)}%`;
  const p = rawPct == null ? 0 : Math.max(0, Math.min(rawPct, 100)) / 100;
  const finalOffset = circumference * (1 - p);

  const offsetAnim = useRef(new Animated.Value(circumference)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      // @ts-ignore RN versions differ
      if (sub && typeof sub.remove === 'function') sub.remove();
    };
  }, []);

  useEffect(() => {
    if (rawPct === null) {
      offsetAnim.setValue(circumference);
      return;
    }
    if (reduceMotion) {
      offsetAnim.setValue(finalOffset);
    } else {
      Animated.timing(offsetAnim, {
        toValue: finalOffset,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [finalOffset, rawPct, reduceMotion, offsetAnim, circumference]);

  // Calories ring color switches by % of target like bars do (green/amber/red).
  // For other rings we keep the brand neon colors from props.glow.
  let crispColor = glow;
  if (label === 'Калории') {
    const pct = rawPct ?? 0;
    if (pct > 110) crispColor = '#EF4444';
    else if (pct > 100) crispColor = '#FFC107';
    else crispColor = '#22C55E';
  }

  const accessibilityLabel =
    rawPct === null
      ? `${label}: цель не задана`
      : `${label}: ${Math.round(rawPct)} процента от цели за выбранный день`;

  return (
    <View style={styles.tile} accessibilityLabel={accessibilityLabel}>
      <View style={styles.ringWrap}>
        <Svg width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Track */}
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
              {/* OUTER glow (wide, faint) */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={glow}
                strokeWidth={strokeWidth + 8}
                strokeLinecap={p === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                opacity={0.15}
                filter="url(#ringGlow)"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              {/* INNER glow (narrower, stronger) */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={glow}
                strokeWidth={strokeWidth}
                strokeLinecap={p === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                opacity={0.45}
                filter="url(#ringGlow)"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              {/* CRISP vivid arc — SOLID, no opacity */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={crispColor}
                strokeWidth={strokeWidth}
                strokeLinecap={p === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              {/* Optional subtle sheen — tiny gradient overlay (very low opacity) */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`url(#${gradient})`}
                strokeWidth={strokeWidth}
                strokeLinecap={p === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                opacity={0.25}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </>
          )}
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

  // Selected day totals (rings show per-day, not week sums)
  const dayTotals = useMemo(() => {
    const dayEntries = entries[selectedDate] || createEmptyDay();
    return aggregateMeals(dayEntries).dayTotals;
  }, [entries, selectedDate]);

  // Build current week date list (Mon..Sun)
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

  // Calories ring color thresholds (like main progress logic)
  const caloriePct = kcalTarget > 0 ? (dayTotals.calories / kcalTarget) * 100 : null;
  let calColors = { gradient: 'gradGreen', glow: '#22C55E' };
  if (caloriePct != null) {
    if (caloriePct > 110) calColors = { gradient: 'gradRed', glow: '#EF4444' };
    else if (caloriePct > 100) calColors = { gradient: 'gradAmber', glow: '#FFC107' };
  }

  const cards = [
    {
      key: 'calories',
      label: 'Калории',
      value: dayTotals.calories,
      target: kcalTarget,
      gradient: calColors.gradient,
      glow: calColors.glow,
    },
    {
      key: 'protein',
      label: 'Белки',
      value: dayTotals.protein,
      target: proteinTarget,
      gradient: 'gradGreen',
      glow: '#FF40FF',
    },
    {
      key: 'fat',
      label: 'Жиры',
      value: dayTotals.fat,
      target: fatTarget,
      gradient: 'gradRed',
      glow: '#00E5FF',
    },
    {
      key: 'carbs',
      label: 'Углеводы',
      value: dayTotals.carbs,
      target: carbsTarget,
      gradient: 'gradBlue',
      glow: '#00FFD5',
    },
  ];

  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dailyData = labels.map((label, i) => ({
    label,
    calories: dailyTotals[i].calories,
    target: kcalTarget,
  }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
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
          />
        ))}
      </View>

      <WeeklyCaloriesCard days={dailyData} />
      <WeeklyMacrosRow totals={weekTotals} kcalTarget={kcalTarget} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    padding: 16,
    backgroundColor: '#000',
    flexGrow: 1,
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
    fontSize: 20,
    fontWeight: '600',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});

export default NutritionStatsScreen;