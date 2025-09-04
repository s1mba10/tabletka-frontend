import React from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { formatPercent } from '../utils/number';

export type Props = {
  date: string;
  takenCount: number;
  scheduledCount: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

const RING_SIZE = 48;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PROGRESS_COLOR_START = '#34D399';
const PROGRESS_COLOR_END = '#06B6D4';
const TRACK_COLOR = '#2C2C2C';

export const MedicationDayStatsButton: React.FC<Props> = ({
  date,
  takenCount,
  scheduledCount,
  style,
  onPress,
}) => {
  const rawPercent = scheduledCount > 0 ? Math.round((takenCount / scheduledCount) * 100) : 0;
  const clampedPercent = Math.max(0, Math.min(200, rawPercent));
  const ringPercent = Math.min(clampedPercent, 100);
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * ringPercent) / 100;
  const percentLabel = formatPercent(clampedPercent);
  const accessibilityLabel =
    scheduledCount === 0
      ? 'Дневная статистика. Напоминаний нет на этот день.'
      : `Дневная статистика. Принято ${takenCount} из ${scheduledCount}. ${percentLabel}.`;

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.left}>
        <Text style={styles.title}>Дневная статистика</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.ringWrapper}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={PROGRESS_COLOR_START} />
                <Stop offset="100%" stopColor={PROGRESS_COLOR_END} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={TRACK_COLOR}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {ringPercent > 0 && (
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="url(#grad)"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            )}
            {clampedPercent > 100 && (
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS + STROKE_WIDTH / 2}
                stroke="url(#grad)"
                strokeWidth={2}
                opacity={0.35}
                fill="none"
              />
            )}
          </Svg>
        </View>
        <View style={styles.percentBlock}>
          <Text style={styles.percentText}>{percentLabel}</Text>
          <Text style={styles.caption}>Принято</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    fontWeight: '600',
  },
  right: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'visible',
    shadowColor: PROGRESS_COLOR_END,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ringSvg: {
    overflow: 'visible',
  },
  percentBlock: {
    justifyContent: 'center',
  },
  percentText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  caption: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});

