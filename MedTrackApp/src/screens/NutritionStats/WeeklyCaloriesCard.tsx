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

  const today = days[6];
  const yesterday = days[5];
  let deltaLabel = '—';
  let deltaColor = '#fff';
  if (today && yesterday && yesterday.calories > 0) {
    const diff = ((today.calories - yesterday.calories) / yesterday.calories) * 100;
    deltaLabel = `${diff >= 0 ? '+' : ''}${Math.round(diff)}%`;
    deltaColor = diff >= 0 ? '#22C55E' : '#EF4444';
  }

  const daysAtOrAboveTarget = days.filter(d => d.target && d.calories >= d.target).length;
  const withData = days.filter(d => d.calories > 0);
  const bestDay = withData.reduce((best, cur) => (cur.calories > best.calories ? cur : best), withData[0] || { label: '', calories: 0 });
  const worstDay = withData.reduce((worst, cur) => (cur.calories < worst.calories ? cur : worst), withData[0] || { label: '', calories: 0 });

  const maxValue = Math.max(
    ...days.map(d => d.calories),
    ...days.map(d => (d.target ?? 0) * 1.2),
    1,
  );

  const hasTargets = days.some(d => d.target != null);

  const deficitCount = days.filter(d => d.target && d.calories < d.target).length;
  const normCount = days.filter(d => d.target && d.calories >= d.target && d.calories <= (d.target * 1.2)).length;
  const surplusCount = days.filter(d => d.target && d.calories > (d.target * 1.2)).length;

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
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>К изменению со вчера</Text>
          <Text style={[styles.kpiValue, { color: deltaColor }]}>{deltaLabel}</Text>
        </View>
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>Всего</Text>
          <Text style={styles.kpiValue}>{`${formatNumber(weekTotal, 0)} ккал`}</Text>
        </View>
        <View style={styles.kpiItem}>
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
          <View style={[styles.segment, { flex: deficitCount, backgroundColor: '#22C55E' }]} />
          <View style={[styles.segment, { flex: normCount, backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={[styles.segment, { flex: surplusCount, backgroundColor: '#EF4444' }]} />
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          Лучш. день: {bestDay.label || '—'} {bestDay.calories ? formatNumber(bestDay.calories, 0) : ''}
        </Text>
        <Text style={styles.footerText}>
          Худш. день: {worstDay.label || '—'} {worstDay.calories ? formatNumber(worstDay.calories, 0) : ''}
        </Text>
        <Text style={styles.footerText}>Дней ≥ цели: {daysAtOrAboveTarget}</Text>
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
    overflow: 'hidden',
    marginBottom: 8,
  },
  segment: {
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
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
