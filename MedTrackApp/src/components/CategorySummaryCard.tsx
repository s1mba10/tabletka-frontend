import React, { useMemo, useState } from 'react';
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

  const onLayout = (e: LayoutChangeEvent) => {
    const newSize = e.nativeEvent.layout.width;
    if (newSize !== size) {
      setSize(newSize);
    }
  };

  const strokeWidth = size * 0.12;
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(percentage, 100)) / 100;

  const gradient = useMemo(() => {
    switch (label) {
      case 'Тренировки':
        return ['#FFB74D', '#FB8C00'];
      case 'Лекарства':
        return ['#64B5F6', '#1E88E5'];
      case 'Питание':
        return ['#81C784', '#388E3C'];
      default:
        return ['#B0BEC5', '#78909C'];
    }
  }, [label]);

  const gradientId = useMemo(() => {
    const encoded = Array.from(label)
      .map((char) => char.charCodeAt(0).toString(16))
      .join('');
    return `summary-gradient-${encoded || 'default'}`;
  }, [label]);

  const formattedPercentage = `${Math.round(progress * 100)}%`;

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      {size > 0 && (
        <>
          <Svg
            pointerEvents="none"
            width={size}
            height={size}
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={gradient[0]} />
                <Stop offset="100%" stopColor={gradient[1]} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {progress > 0 && (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
              />
            )}
          </Svg>
          <View
            style={[
              styles.innerCard,
              {
                top: strokeWidth * 0.85,
                right: strokeWidth * 0.85,
                bottom: strokeWidth * 0.85,
                left: strokeWidth * 0.85,
              },
            ]}
          >
            <View style={styles.iconWrapper}>
              <Icon name={icon} size={20} color="rgba(0,0,0,0.35)" />
            </View>
            <Text style={styles.percentage}>{formattedPercentage}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCard: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    backgroundColor: '#F7F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginBottom: 4,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  label: {
    color: '#5F6368',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default CategorySummaryCard;
