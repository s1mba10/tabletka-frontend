import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  Easing,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export type Props = {
  /** ISO date yyyy-MM-dd for the calendar’s selected day */
  date: string;
  /** count of doses marked as taken for that day */
  takenCount: number;
  /** total scheduled doses for that day (0 allowed) */
  scheduledCount: number;
  /** optional tap handler; keep but do not use for now */
  onPress?: () => void;
  /** optional container style override */
  style?: import('react-native').ViewStyle;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MedicationDayStatsButton: React.FC<Props> = ({
  date: _date,
  takenCount,
  scheduledCount,
  onPress,
  style,
}) => {
  const percent = scheduledCount > 0 ? Math.round((takenCount / scheduledCount) * 100) : 0;
  const clamped = Math.min(percent, 100);
  const size = 52;
  const radius = 22;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = clamped / 100;
  const finalOffset = circumference * (1 - progress);

  const offsetAnim = useRef(new Animated.Value(circumference)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      // @ts-ignore react-native types
      if (sub && typeof sub.remove === 'function') {
        sub.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (scheduledCount === 0) {
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
  }, [finalOffset, reduceMotion, circumference, offsetAnim, scheduledCount]);

  const halo = percent > 100;
  const color = "#00E5FF";
  if (scheduledCount === 0) {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
        style={({ pressed }) => [
          styles.container,
          styles.emptyContainer,
          style,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Дневная статистика. Нет запланированных приёмов."
      >
        <Text style={[styles.title, styles.emptyTitle]}>Нет запланированных приёмов</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      style={({ pressed }) => [
        styles.container,
        style,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Дневная статистика. Принято ${takenCount} из ${scheduledCount}. ${percent} процентов.`}
    >
      <Text style={styles.title}>Дневная статистика</Text>
      <View style={styles.rightCluster}>
        <Svg width={size} height={size} style={styles.ringSvg}>
          {/* track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {scheduledCount > 0 && (
            <>
              {halo && (
                <AnimatedCircle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={color}
                  strokeWidth={strokeWidth + 12}
                  strokeLinecap="butt"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offsetAnim}
                  opacity={0.15}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              )}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth + 6}
                strokeLinecap={progress === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                opacity={0.15}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap={progress === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                opacity={0.35}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap={progress === 1 ? 'butt' : 'round'}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offsetAnim}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </>
          )}
        </Svg>
        <View style={styles.textCol}>
          <Text style={styles.percent}>{`${percent}%`}</Text>
          <Text style={styles.caption}>Принято</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  rightCluster: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ringSvg: {
    overflow: 'visible',
  },
  textCol: {
    marginLeft: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  percent: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  caption: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
  },
  emptyTitle: {
    flex: 0,
    textAlign: 'center',
  },
});

export default MedicationDayStatsButton;
