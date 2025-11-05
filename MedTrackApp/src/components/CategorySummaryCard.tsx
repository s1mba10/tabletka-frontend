import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
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

  const onLayout = (e: LayoutChangeEvent) => {
    const newSize = e.nativeEvent.layout.width;
    if (newSize !== size) {
      setSize(newSize);
    }
  };

  const cappedProgress = Math.max(0, Math.min(percentage, 100));
  const progress = cappedProgress / 100;

  const { gradient, accent } = useMemo(() => {
    switch (label) {
      case 'Питание':
        return {
          gradient: ['#FFB74D', '#FF9800'],
          accent: '#FF9800',
        };
      case 'Тренировки':
        return {
          gradient: ['#8BC34A', '#4CAF50'],
          accent: '#4CAF50',
        };
      case 'Лекарства':
      default:
        return {
          gradient: ['#64B5F6', '#1E88E5'],
          accent: '#1E88E5',
        };
    }
  }, [label]);

  const gradientId = useMemo(
    () => `gradient-${label}-${icon}`.replace(/[^a-zA-Z0-9_-]/g, ''),
    [icon, label],
  );

  const circleSize = Math.max(size * 0.6, 0);
  const radius = circleSize / 2;
  const strokeWidth = 10;
  const innerRadius = Math.max(radius - strokeWidth / 2, 0);
  const circumference = 2 * Math.PI * innerRadius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={18} color={accent} />
        </View>
        <View style={styles.circleWrapper}>
          {size > 0 && (
            <View style={{ width: circleSize, height: circleSize }}>
              <Svg width={circleSize} height={circleSize}>
                <Defs>
                  <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={gradient[0]} />
                    <Stop offset="100%" stopColor={gradient[1]} />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx={radius}
                  cy={radius}
                  r={innerRadius}
                  stroke="#EFF1F5"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <Circle
                  cx={radius}
                  cy={radius}
                  r={innerRadius}
                  stroke={`url(#${gradientId})`}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  rotation="-90"
                  origin={`${radius}, ${radius}`}
                />
              </Svg>
              <View style={styles.percentageContainer} pointerEvents="none">
                <Text style={styles.percentageValue}>{`${Math.round(cappedProgress)}%`}</Text>
              </View>
            </View>
          )}
        </View>
        <Text style={styles.label}>{label}</Text>
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FB',
  },
  circleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#2D3142',
    fontSize: 13,
    fontWeight: '600',
  },
  percentageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageValue: {
    color: '#2D3142',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CategorySummaryCard;
