import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
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
  const borderRadius = 10;
  const innerRadius = Math.max(0, borderRadius - thickness / 2);

  const getColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FFC107';
    return '#FF5722';
  };
  const color = getColor(percentage);

  // progress from 0 to 4 (number of sides)
  const progress = Math.max(0, Math.min(percentage, 100)) / 25;
  const sides = [
    Math.min(progress, 1),
    Math.min(Math.max(progress - 1, 0), 1),
    Math.min(Math.max(progress - 2, 0), 1),
    Math.min(Math.max(progress - 3, 0), 1),
  ];

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <View style={[styles.card, { margin: thickness, borderRadius: innerRadius }]}>
        <Icon name={icon} size={26} color="#fff" />
        <Text style={styles.label}>{label}</Text>
      </View>
      {size > 0 && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.track,
              {
                borderWidth: thickness,
                borderRadius,
              },
            ]}
          />
          {/* Top edge */}
          <View
            pointerEvents="none"
            style={[
              styles.edge,
              {
                top: 0,
                left: 0,
                height: thickness,
                width: `${sides[0] * 100}%`,
                backgroundColor: color,
                borderTopLeftRadius: borderRadius,
                borderTopRightRadius: sides[0] === 1 ? borderRadius : 0,
              },
            ]}
          />
          {/* Right edge */}
          <View
            pointerEvents="none"
            style={[
              styles.edge,
              {
                top: 0,
                right: 0,
                width: thickness,
                height: `${sides[1] * 100}%`,
                backgroundColor: color,
                borderTopRightRadius: sides[0] === 1 ? borderRadius : 0,
                borderBottomRightRadius: sides[1] === 1 ? borderRadius : 0,
              },
            ]}
          />
          {/* Bottom edge */}
          <View
            pointerEvents="none"
            style={[
              styles.edge,
              {
                bottom: 0,
                right: 0,
                height: thickness,
                width: `${sides[2] * 100}%`,
                backgroundColor: color,
                borderBottomRightRadius: sides[1] === 1 ? borderRadius : 0,
                borderBottomLeftRadius: sides[2] === 1 ? borderRadius : 0,
              },
            ]}
          />
          {/* Left edge */}
          <View
            pointerEvents="none"
            style={[
              styles.edge,
              {
                left: 0,
                bottom: 0,
                width: thickness,
                height: `${sides[3] * 100}%`,
                backgroundColor: color,
                borderBottomLeftRadius: sides[2] === 1 ? borderRadius : 0,
                borderTopLeftRadius: sides[3] === 1 ? borderRadius : 0,
              },
            ]}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderColor: '#2C2C2C',
  },
  edge: {
    position: 'absolute',
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
