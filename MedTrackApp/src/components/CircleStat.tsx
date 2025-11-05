import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export type CircleStatProps = {
  label: string;
  value: number;
  color: string;
  trackColor: string;
  valueColor: string;
  labelColor: string;
  backgroundColor: string;
};

const SIZE = 96;
const STROKE_WIDTH = 11;
const GAP_PERCENT = 0.07; // 7% разрыв

const CircleStat: React.FC<CircleStatProps> = ({
  label,
  value,
  color,
  trackColor,
  valueColor,
  labelColor,
  backgroundColor,
}) => {
  const {
    radius,
    circumference,
    gapLength,
    adjustedCircumference,
    clampedValue,
    progressLength,
    dashOffset,
    innerSize,
    innerOffset,
  } = useMemo(() => {
      const r = (SIZE - STROKE_WIDTH) / 2;
      const circleCircumference = 2 * Math.PI * r;
      const gap = circleCircumference * GAP_PERCENT;
      const availableCircumference = circleCircumference - gap;
      const safeValue = Math.max(0, Math.min(100, value));
      const progress = (availableCircumference * safeValue) / 100;
      const offset = circleCircumference - gap - progress;
      const inner = SIZE - STROKE_WIDTH * 2.2;
      const inset = (SIZE - inner) / 2;

      return {
        radius: r,
        circumference: circleCircumference,
        gapLength: gap,
        adjustedCircumference: availableCircumference,
        clampedValue: safeValue,
        progressLength: progress,
        dashOffset: offset,
        innerSize: inner,
        innerOffset: inset,
      };
    }, [value]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.circleContainer, { width: SIZE, height: SIZE }]}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={[adjustedCircumference, gapLength]}
            strokeDashoffset={gapLength / 2}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[progressLength, circumference]}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View
          style={[
            styles.valueContainer,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor,
              top: innerOffset,
              left: innerOffset,
            },
          ]}
        >
          <Text style={[styles.valueText, { color: valueColor }]}>{clampedValue}%</Text>
        </View>
      </View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CircleStat;
