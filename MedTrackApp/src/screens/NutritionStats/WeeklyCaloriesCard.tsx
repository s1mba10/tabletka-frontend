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

  const hasTargets = days.some(d => d.target != null);
  const maxValue = hasTargets
    ? Math.max(...days.map(d => (d.target ?? 0) * 1.2), 1)
    : Math.max(...days.map(d => d.calories), 1);

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
