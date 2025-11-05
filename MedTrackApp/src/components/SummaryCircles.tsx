import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import CircleStat from './CircleStat';

const SummaryCircles: React.FC = () => {
  const theme = useMemo(
    () => ({
      colors: {
        background: '#121212',
        surfaceVariant: 'rgba(255,255,255,0.12)',
        onBackground: '#F5F5F5',
        onSurfaceVariant: 'rgba(245,245,245,0.72)',
        strain: '#FF8A3C',
        recovery: '#4CAF50',
        sleep: '#4C6EF5',
      },
    }),
    [],
  );

  const data = [
    { label: 'Питание', value: 77, color: theme.colors.recovery },
    { label: 'Тренировки', value: 38, color: theme.colors.strain },
    { label: 'Лекарства', value: 67, color: theme.colors.sleep },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {data.map((item) => (
        <CircleStat
          key={item.label}
          label={item.label}
          value={item.value}
          color={item.color}
          trackColor={theme.colors.surfaceVariant}
          valueColor={theme.colors.onBackground}
          labelColor={theme.colors.onSurfaceVariant}
          backgroundColor={theme.colors.background}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    marginVertical: 16,
  },
});

export default SummaryCircles;
