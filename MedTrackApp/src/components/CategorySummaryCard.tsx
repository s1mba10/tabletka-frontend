import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type CategorySummaryCardProps = {
  icon: string;
  label: string;
  percentage: number;
};

const CategorySummaryCard: React.FC<CategorySummaryCardProps> = ({
  icon,
  label,
  percentage,
}) => {
  const [size, setSize] = useState(0);
  const [gradientId] = useState(
    () => `category-summary-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).slice(2, 10)}`,
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const newSize = e.nativeEvent.layout.width;
    if (newSize !== size) {
      setSize(newSize);
    }
  };

  const circleSize = size * 0.68;
  const strokeWidth = circleSize * 0.14;
  const radius = Math.max(0, (circleSize - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.max(0, Math.min(percentage, 100));
  const progress = clampedPercentage / 100;

  const getPalette = (title: string) => {
    switch (title) {
      case 'Питание':
        return { start: '#FFB347', end: '#FF6F3C' };
      case 'Тренировки':
        return { start: '#8BC34A', end: '#43A047' };
      case 'Лекарства':
      default:
        return { start: '#64B5F6', end: '#5C6BC0' };
    }
  };

  const palette = getPalette(label);
  const iconBackground = `${palette.start}33`;

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <View style={styles.card}>
        {size > 0 && (
          <View style={[styles.circleWrapper, { width: circleSize, height: circleSize }]}>
            <Svg
              pointerEvents="none"
              width={circleSize}
              height={circleSize}
            >
              <Defs>
                <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={palette.start} />
                  <Stop offset="100%" stopColor={palette.end} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="#EAEFF5"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {progress > 0 && (
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke={`url(#${gradientId})`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  fill="none"
                  rotation="-90"
                  origin={`${circleSize / 2}, ${circleSize / 2}`}
                />
              )}
            </Svg>
            <View style={styles.circleContent}>
              <Text style={styles.percentage}>{`${Math.round(clampedPercentage)}%`}</Text>
            </View>
          </View>
        )}
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.iconBadge, { backgroundColor: iconBackground }]}>
            <Icon name={icon} size={18} color={palette.end} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    shadowColor: '#141414',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  labelRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  label: {
    color: '#424242',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  iconBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default CategorySummaryCard;
