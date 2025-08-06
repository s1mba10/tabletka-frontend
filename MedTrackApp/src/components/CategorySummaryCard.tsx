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

  const strokeWidth = size * 0.1;
  const innerSize = size - strokeWidth;
  const borderRadius = 10;
  const perimeter = 4 * (innerSize - borderRadius) + 2 * Math.PI * borderRadius;
  const strokeDashoffset = perimeter - (perimeter * percentage) / 100;

  const getColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FFC107';
    return '#FF5722';
  };
  const color = getColor(percentage);

  const onLayout = (e: LayoutChangeEvent) => {
    const newSize = e.nativeEvent.layout.width;
    if (newSize !== size) {
      setSize(newSize);
    }
  };

  return (
    <View style={[styles.wrapper, { padding: strokeWidth / 2 }]} onLayout={onLayout}>
      {size > 0 && (
        <Svg height={size} width={size} style={styles.progress}>
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={innerSize}
            height={innerSize}
            stroke="#2C2C2C"
            strokeWidth={strokeWidth}
            fill="transparent"
            rx={borderRadius}
            ry={borderRadius}
          />
          <Rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={innerSize}
            height={innerSize}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${perimeter} ${perimeter}`}
            strokeDashoffset={strokeDashoffset}
            fill="transparent"
            rx={borderRadius}
            ry={borderRadius}
          />
        </Svg>
      )}
      <View style={styles.card}>
        <Icon name={icon} size={26} color="#fff" />
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
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
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
