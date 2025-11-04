import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, AccessibilityInfo, Animated, Easing } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Circle } from 'react-native-svg';
import { addDays, format, parseISO } from 'date-fns';

import { RootStackParamList } from '../../navigation';
import { loadDiary } from '../../nutrition/storage';
import { aggregateMeals } from '../../nutrition/aggregate';
import { createEmptyDay } from '../../nutrition/utils';
import WeeklyCaloriesCard from './WeeklyCaloriesCard';
import WeeklyMacrosRow from './WeeklyMacrosRow';
import { MealType, NormalizedEntry } from '../../nutrition/types';
import { styles } from './styles';
import { NUTRITION_DEFAULTS } from '../../constants/nutritionDefaults';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// targets
const kcalTarget = NUTRITION_DEFAULTS.DAILY_CALORIES_TARGET_KCAL;
const proteinTarget = NUTRITION_DEFAULTS.DAILY_PROTEIN_TARGET_G;
const fatTarget = NUTRITION_DEFAULTS.DAILY_FAT_TARGET_G;
const carbsTarget = NUTRITION_DEFAULTS.DAILY_CARBS_TARGET_G;

/**
 * Один прогресс-ринг без градиентов/фильтров.
 * Яркая «чистая» дуга + два мягких слоя свечения (шире и полуширокий).
 */
const ProgressRing: React.FC<{
  value: number;
  target?: number | null;
  label: string;
  glow: string; // базовый цвет для не-калорийных колец
}> = React.memo(({ value, target, label, glow }) => {
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
      // @ts-ignore RN версионирование
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

  // Цвет калорий меняется по порогам; остальные — фиксированные «брендовые»
  let crispColor = glow;
  if (label === 'Калории') {
    const pct = rawPct ?? 0;
    if (pct > 110) crispColor = '#EF4444'; // красный
    else if (pct > 100) crispColor = '#FFC107'; // янтарный
    else crispColor = '#22C55E'; // зелёный
  }

  const accessibilityLabel =
    rawPct === null
      ? `${label}: цель не задана`
      : `${label}: ${Math.round(rawPct)} процента от цели за выбранный день`;

  return (
    <View style={styles.tile} accessibilityLabel={accessibilityLabel}>
      <View style={styles.ringWrap}>
        <Svg width={size} height={size} style={{ overflow: 'visible' }}>
          {/* трек */}
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
              {/* внешнее мягкое свечение (шире) */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={crispColor}
                strokeWidth={strokeWidth + 8}
                strokeLinecap={p === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                opacity={0.15}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              {/* внутреннее свечение (чуть уже) */}
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
                opacity={0.35}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              {/* основная «чистая» дуга */}
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

  // Totals за выбранный день (кольца показывают день, не неделю)
  const dayTotals = useMemo(() => {
    const dayEntries = entries[selectedDate] || createEmptyDay();
    return aggregateMeals(dayEntries).dayTotals;
  }, [entries, selectedDate]);

  // Даты текущей недели (Пн..Вс)
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

  // Цвета для колец
  const caloriePct = kcalTarget > 0 ? (dayTotals.calories / kcalTarget) * 100 : null;
  let calGlow = '#22C55E';
  if (caloriePct != null) {
    if (caloriePct > 110) calGlow = '#EF4444';
    else if (caloriePct > 100) calGlow = '#FFC107';
  }

  const cards = [
    { key: 'calories', label: 'Калории', value: dayTotals.calories, target: kcalTarget, glow: calGlow },
    { key: 'protein',  label: 'Белки',   value: dayTotals.protein,  target: proteinTarget, glow: '#FF40FF' },
    { key: 'fat',      label: 'Жиры',    value: dayTotals.fat,      target: fatTarget,     glow: '#00E5FF' },
    { key: 'carbs',    label: 'Углеводы',value: dayTotals.carbs,    target: carbsTarget,   glow: '#00FFD5' },
  ];

  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dailyData = labels.map((label, i) => ({
    label,
    calories: dailyTotals[i].calories,
    target: kcalTarget,
  }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.cardRow}>
        {cards.map(c => (
          <ProgressRing
            key={c.key}
            value={c.value}
            target={c.target}
            label={c.label}
            glow={c.glow}
          />
        ))}
      </View>

      <WeeklyCaloriesCard days={dailyData} />
      <WeeklyMacrosRow totals={weekTotals} kcalTarget={kcalTarget} />
    </ScrollView>
  );
};

export default NutritionStatsScreen;