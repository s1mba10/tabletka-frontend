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
import { formatNumber } from '../../utils/number';
import WeeklyCaloriesCard from './WeeklyCaloriesCard';
import { MealType, NormalizedEntry } from '../../nutrition/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
      <LinearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#34D399" />
        <Stop offset="100%" stopColor="#22C55E" />
      </LinearGradient>
      <LinearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FFD54F" />
        <Stop offset="100%" stopColor="#FFC107" />
      </LinearGradient>
      <LinearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FF6B6B" />
        <Stop offset="100%" stopColor="#EF4444" />
      </LinearGradient>
      <LinearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#3B82F6" />
      </LinearGradient>
      <Filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur stdDeviation="6" />
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
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      // @ts-ignore types mismatch across RN versions
      if (sub && typeof sub.remove === 'function') sub.remove();
    };
  }, []);

  useEffect(() => {
    if (rawPct === null) {
      offsetAnim.setValue(circumference);
      glowOpacity.setValue(0);
      return;
    }
    if (reduceMotion) {
      offsetAnim.setValue(finalOffset);
      glowOpacity.setValue(0.45);
    } else {
      Animated.parallel([
        Animated.timing(offsetAnim, {
          toValue: finalOffset,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [finalOffset, rawPct, reduceMotion, offsetAnim, glowOpacity, circumference]);

  const accessibilityLabel =
    rawPct === null
      ? `${label}: цель не задана`
      : `${label}: ${Math.round(rawPct)} процента от цели за выбранный день`;

  return (
    <View style={styles.tile} accessibilityLabel={accessibilityLabel}>
      <View style={styles.ringWrap}>
        <Svg width={size} height={size}>
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
                opacity={glowOpacity}
                filter="url(#ringGlow)"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
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
      glow: '#00FFFF',
    },
    {
      key: 'fat',
      label: 'Жиры',
      value: dayTotals.fat,
      target: fatTarget,
      gradient: 'gradRed',
      glow: '#FF00FF',
    },
    {
      key: 'carbs',
      label: 'Углеводы',
      value: dayTotals.carbs,
      target: carbsTarget,
      gradient: 'gradBlue',
      glow: '#FF8000',
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
                  weekTotals.calories - kcalTarget * 7 >= 0 ? '#EF4444' : '#22C55E',
              },
            ]}
          >
            {formatNumber(weekTotals.calories - kcalTarget * 7)} ккал
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

