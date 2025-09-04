import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AccessibilityInfo,
  Easing,
  Pressable,
  Text,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type Props = {
  date: string;
  takenCount: number;
  scheduledCount: number;
  style?: ViewStyle;
  onPress?: () => void;
};

export const MedicationDayStatsButton: React.FC<Props> = ({
  date: _date,
  takenCount,
  scheduledCount,
  style,
  onPress = () => {},
}) => {
  const percent = scheduledCount > 0 ? Math.round((takenCount / scheduledCount) * 100) : 0;
  const progress = Math.min(percent, 100) / 100;

  const size = 52;
  const radius = 20;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const finalOffset = circumference * (1 - progress);

  const offsetAnim = useRef(new Animated.Value(circumference)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      // @ts-ignore RN event types
      if (sub && typeof sub.remove === 'function') sub.remove();
    };
  }, []);

  useEffect(() => {
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
  }, [finalOffset, reduceMotion, offsetAnim]);

  const crispColor = '#00E5FF';

  const accessibilityLabel = `Дневная статистика. Принято ${takenCount} из ${scheduledCount}. ${percent}%.`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.container,
        style,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.title}>Дневная статистика</Text>
      <View style={styles.rightCluster}>
        <Svg width={size} height={size} style={{ overflow: 'visible' }}>
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
              {percent > 100 && (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={crispColor}
                  strokeWidth={2}
                  opacity={0.5}
                  fill="none"
                />
              )}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={crispColor}
                strokeWidth={strokeWidth + 4}
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
                stroke={crispColor}
                strokeWidth={strokeWidth + 2}
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
                stroke={crispColor}
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
        <View style={styles.percentStack}>
          <Text style={styles.percent}>{percent}%</Text>
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: 'visible',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rightCluster: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  percentStack: {
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  percent: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  caption: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
});

