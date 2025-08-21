import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type MacroValue = {
  consumed: number;
  target?: number;
};

export type MacronutrientSummaryProps = {
  calories: MacroValue;
  protein: MacroValue;
  fat: MacroValue;
  carbs: MacroValue;
};

const MacronutrientSummary: React.FC<MacronutrientSummaryProps> = ({
  calories,
  protein,
  fat,
  carbs,
}) => {
  const nutrients = [
    { label: 'Protein', ...protein },
    { label: 'Fat', ...fat },
    { label: 'Carbs', ...carbs },
  ];

  const rawPercent = calories.target
    ? Math.round((calories.consumed / calories.target) * 100)
    : 0;
  const barPercent = Math.min(rawPercent, 100);
  let barColor = '#22C55E';
  if (rawPercent === 100) {
    barColor = '#F59E0B';
  } else if (rawPercent > 100) {
    barColor = '#EF4444';
  }

  return (
    <View style={styles.container}>
      <View style={styles.macroRow}>
        {nutrients.map(n => (
          <View key={n.label} style={styles.macroBlock}>
            <Text style={styles.macroLabel}>{n.label}</Text>
            <Text style={styles.macroValue}>
              {n.consumed}/{n.target ?? '—'} g
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.caloriesRow}>
        <Text style={styles.caloriesValue}>
          {calories.consumed}/{calories.target ?? '—'} kcal
        </Text>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${barPercent}%`, backgroundColor: barColor },
            ]}
          />
        </View>
        <Text style={styles.percentage}>{rawPercent}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroBlock: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  macroValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  caloriesRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  caloriesValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#323232',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 12,
  },
});

export default MacronutrientSummary;
