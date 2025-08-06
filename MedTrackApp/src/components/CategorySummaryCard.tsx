import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
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

  const thickness = size * 0.1;
  const outerRadius = size * 0.25;
  const cardRadius = Math.max(0, outerRadius - thickness);
  const pathRadius = Math.max(0, outerRadius - thickness / 2);
  const rectSize = size - thickness;
  const perimeter =
    4 * (rectSize - 2 * pathRadius) + 2 * Math.PI * pathRadius;

  const getColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FFC107';
    return '#FF5722';
  };
  const color = getColor(percentage);

  const progress = Math.max(0, Math.min(percentage, 100)) / 100;

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <View style={[styles.card, { margin: thickness, borderRadius: cardRadius }]}>
        <Icon name={icon} size={26} color="#fff" />
        <Text style={styles.label}>{label}</Text>
      </View>
      {size > 0 && (
        <Svg
          pointerEvents="none"
          width={size}
          height={size}
          style={StyleSheet.absoluteFill}
        >
          <Rect
            x={thickness / 2}
            y={thickness / 2}
            width={size - thickness}
            height={size - thickness}
            rx={pathRadius}
            ry={pathRadius}
            stroke="#2C2C2C"
            strokeWidth={thickness}
            fill="none"
          />
          {progress > 0 && (
            <Rect
              x={thickness / 2}
              y={thickness / 2}
              width={size - thickness}
              height={size - thickness}
              rx={pathRadius}
              ry={pathRadius}
              stroke={color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={`${perimeter} ${perimeter}`}
              strokeDashoffset={perimeter * (1 - progress)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      )}
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
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CategorySummaryCard;
