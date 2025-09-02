import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Svg, { Rect, Defs, Filter, FeGaussianBlur } from 'react-native-svg';
import { formatNumber } from '../../utils/number';

interface DayData {
  label: string; // short label like 'Пн'
  calories: number;
  target?: number | null;
}

interface Props {
  days: DayData[];
  onAddFood?: () => void;
}

const maxBarHeight = 140;

const fullDayMap: Record<string, string> = {
  Пн: 'Понедельник',
  Вт: 'Вторник',
  Ср: 'Среда',
  Чт: 'Четверг',
  Пт: 'Пятница',
  Сб: 'Суббота',
  Вс: 'Воскресенье',
};

const WeeklyCaloriesCard: React.FC<Props> = ({ days, onAddFood }) => {
  const animations = useRef(days.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = days.map((_, i) =>
      Animated.timing(animations[i], {
        toValue: 1,
        duration: 600,
        delay: i * 80,
        useNativeDriver: false,
      }),
    );
    Animated.stagger(60, anims).start();
  }, [animations, days]);

  const weekTotal = days.reduce((s, d) => s + d.calories, 0);
  const weekAvg = weekTotal / days.length;


  const allZero = days.every(d => d.calories === 0);
  let minDay: DayData | null = null;
  let maxDay: DayData | null = null;
  if (!allZero) {
    days.forEach(day => {
      if (day.calories > 0 && (!minDay || day.calories < minDay.calories)) {
        minDay = day;
      }
      if (!maxDay || day.calories > maxDay.calories) {
        maxDay = day;
      }
    });
  }

  const hasTargets = days.some(d => d.target != null);
  const maxValue = hasTargets
    ? Math.max(...days.map(d => (d.target ?? 0) * 1.2), 1)
    : Math.max(...days.map(d => d.calories), 1);

  const deficitCount = days.filter(d => d.target && d.calories < d.target).length;
  const normCount = days.filter(d => d.target && d.calories >= d.target && d.calories <= (d.target * 1.2)).length;
  const surplusCount = days.filter(d => d.target && d.calories > (d.target * 1.2)).length;

  const deficitStyle = { flex: deficitCount };
  const normStyle = { flex: normCount };
  const surplusStyle = { flex: surplusCount };

  if (weekTotal === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>Данных за эту неделю пока нет</Text>
        {onAddFood && (
          <TouchableOpacity style={styles.emptyButton} onPress={onAddFood}>
            <Text style={styles.emptyButtonText}>Добавить еду</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Неделя по калориям</Text>
      <View style={styles.kpiRow}>
        <View
          style={styles.kpiItem}
          accessible
          accessibilityLabel={`Всего: ${formatNumber(weekTotal, 0)} килокалорий за неделю`}
        >
          <Text style={styles.kpiLabel}>Всего</Text>
          <Text style={styles.kpiValue}>{`${formatNumber(weekTotal, 0)} ккал`}</Text>
        </View>
        <View
          style={styles.kpiItem}
          accessible
          accessibilityLabel={`В среднем: ${formatNumber(weekAvg, 0)} килокалорий в день`}
        >
          <Text style={styles.kpiLabel}>В среднем</Text>
          <Text style={styles.kpiValue}>{`${formatNumber(weekAvg, 0)} ккал/день`}</Text>
        </View>
      </View>

      <View style={styles.barsRow}>
        {days.map((day, i) => {
          const hasData = day.calories > 0;
          const pctOfMax = hasData ? Math.min(day.calories / maxValue, 1) : 0;
          const barHeight = animations[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, maxBarHeight * pctOfMax],
          });

          let barColor: string | null = null;
          if (hasData) {
            if (!day.target) {
              barColor = '#22C55E';
            } else {
              const pct = day.calories / day.target;
              if (pct <= 1) barColor = '#22C55E';
              else if (pct <= 1.2) barColor = '#F59E0B';
              else barColor = '#EF4444';
            }
          }

          const glowColorMap: Record<string, string> = {
            '#22C55E': 'rgba(34,197,94,0.5)',
            '#F59E0B': 'rgba(245,158,11,0.5)',
            '#EF4444': 'rgba(239,68,68,0.5)',
          };
          const glow = barColor ? glowColorMap[barColor] : undefined;

          const accessibilityLabel = hasData
            ? day.target
              ? `${fullDayMap[day.label]}: ${formatNumber(day.calories, 0)} килокалорий, ${Math.round((day.calories / day.target) * 100)} процентов от цели`
              : `${fullDayMap[day.label]}: ${formatNumber(day.calories, 0)} килокалорий`
            : `${fullDayMap[day.label]}: данных нет`;

          return (
            <View key={day.label} accessible accessibilityLabel={accessibilityLabel}>
              <View style={styles.barWrapper}>
                <View style={styles.track} />
                {hasTargets && day.target && (
                  <View
                    style={[styles.targetLine, { bottom: (day.target / maxValue) * maxBarHeight }]}
                  />
                )}
                {hasData && barColor && (
                  <Animated.View style={[styles.bar, { height: barHeight }]}> 
                    <Svg width={16} height="100%">
                      <Defs>
                        <Filter id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                          <FeGaussianBlur stdDeviation={6} />
                        </Filter>
                      </Defs>
                      <Rect
                        width={16}
                        height="100%"
                        rx={8}
                        ry={8}
                        fill={glow}
                        filter={`url(#glow-${i})`}
                      />
                      <Rect width={16} height="100%" rx={8} ry={8} fill={barColor} />
                    </Svg>
                  </Animated.View>
                )}
              </View>
              <Text style={styles.dayLabel}>{day.label}</Text>
            </View>
          );
        })}
      </View>

      {hasTargets && (
        <View style={styles.segmentBar}>
          <View style={[styles.segment, styles.segmentDeficit, deficitStyle]} />
          <View style={[styles.segment, styles.segmentNorm, normStyle]} />
          <View style={[styles.segment, styles.segmentSurplus, surplusStyle]} />
        </View>
      )}
      <View style={styles.chipsRow}>
        <View
          style={[styles.chip, styles.chipMin]}
          accessible
          accessibilityLabel=
          {minDay
            // @ts-ignore
              ? `Минимум за неделю: ${fullDayMap[minDay.label]}, ${formatNumber(minDay.calories, 0)} килокалорий`
              : 'Минимум за неделю: данных нет'}
        >
          <Text style={styles.chipTitle}>Минимум за неделю</Text>
          <Text style={[styles.chipValue, styles.chipValueMin]}>
            {/* @ts-ignore */}
            {minDay ? `${minDay.label} · ${formatNumber(minDay.calories, 0)} ккал` : '—'}
          </Text>
        </View>
        <View
          style={[styles.chip, styles.chipMax]}
          accessible
          accessibilityLabel=
          {maxDay
            // @ts-ignore
              ? `Максимум за неделю: ${fullDayMap[maxDay.label]}, ${formatNumber(maxDay.calories, 0)} килокалорий`
              : 'Максимум за неделю: данных нет'}
        >
          <Text style={styles.chipTitle}>Максимум за неделю</Text>
          <Text style={[styles.chipValue, styles.chipValueMax]}>
            {/* @ts-ignore */}
            {maxDay ? `${maxDay.label} · ${formatNumber(maxDay.calories, 0)} ккал` : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  kpiValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  barWrapper: {
    width: 16,
    height: maxBarHeight,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 6,
  },
  track: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: maxBarHeight,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: 16,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dayLabel: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  segmentBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  segment: {
    height: '100%',
  },
  segmentDeficit: {
    backgroundColor: '#22C55E',
  },
  segmentNorm: {
    backgroundColor: '#FFC107',
  },
  segmentSurplus: {
    backgroundColor: '#EF4444',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  chipMin: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  chipMax: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  chipTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  chipValueMin: {
    color: '#22C55E',
  },
  chipValueMax: {
    color: '#EF4444',
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  emptyButtonText: {
    color: '#22C55E',
    fontWeight: '600',
  },
});

export default WeeklyCaloriesCard;
