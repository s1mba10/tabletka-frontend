import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
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

  const maxValue = Math.max(
    ...days.map(d => d.calories),
    ...days.map(d => (d.target ?? 0) * 1.2),
    1,
  );

  const hasTargets = days.some(d => d.target != null);

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
          const pctOfMax = day.calories / maxValue;
          const barHeight = animations[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, maxBarHeight * pctOfMax],
          });

          let color = 'transparent';
          if (day.calories > 0) {
            if (!day.target) {
              color = 'rgba(34,197,94,0.8)';
            } else {
              const pct = (day.calories / day.target) * 100;
              if (pct <= 100) {
                color = '#22C55E';
              } else if (pct <= 120) {
                color = '#FFC107';
              } else {
                color = '#EF4444';
              }
            }
          }

          const accessibilityLabel = day.target
            ? `${fullDayMap[day.label]}: ${formatNumber(day.calories, 0)} килокалорий, ${Math.round((day.calories / day.target) * 100)} процентов от цели`
            : `${fullDayMap[day.label]}: ${formatNumber(day.calories, 0)} килокалорий`;

          return (
            <View key={day.label} accessible accessibilityLabel={accessibilityLabel}>
              <View style={styles.barWrapper}>
                <View style={styles.track} />
                {hasTargets && day.target && (
                  <View
                    style={[styles.targetLine, { bottom: (day.target / maxValue) * maxBarHeight }]}
                  />
                )}
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: color,
                      shadowColor: color,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                    },
                  ]}
                />
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
    borderRadius: 8,
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
    marginBottom: 8,
  },
  segment: {
    height: '100%',
  },
  segmentDeficit: {
    backgroundColor: '#22C55E',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  segmentNorm: {
    backgroundColor: '#FFC107',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  segmentSurplus: {
    backgroundColor: '#EF4444',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
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
