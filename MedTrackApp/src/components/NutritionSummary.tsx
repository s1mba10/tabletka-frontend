import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type NutritionSummaryProps = {
  totals: { calories: number; protein: number; fat: number; carbs: number };
  targets?: { calories: number; protein: number; fat: number; carbs: number };
};

const NutritionSummary: React.FC<NutritionSummaryProps> = ({ totals, targets }) => {
  const calorieTarget = targets?.calories;
  const percent = calorieTarget ? Math.round((totals.calories / calorieTarget) * 100) : null;
  const progress = calorieTarget ? Math.min(totals.calories / calorieTarget, 1) : 0;

  const barColor =
    percent === null
      ? '#22C55E'
      : percent <= 100
      ? '#22C55E'
      : percent <= 120
      ? '#F59E0B'
      : '#EF4444';

  const macros = [
    { label: 'Protein', value: totals.protein, target: targets?.protein },
    { label: 'Fat', value: totals.fat, target: targets?.fat },
    { label: 'Carbs', value: totals.carbs, target: targets?.carbs },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.macrosRow}>
        {macros.map(macro => (
          <View key={macro.label} style={styles.macroBlock}>
            <Text style={styles.macroLabel}>{macro.label}</Text>
            <Text style={styles.macroValue}>
              {macro.value}/{macro.target ?? '—'} g
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.caloriesContainer}>
        <Text style={styles.caloriesText}>
          {totals.calories}/{calorieTarget ?? '—'} kcal ({percent ?? '—'}%)
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  macroBlock: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  macroLabel: {
    fontSize: 12,
    color: 'white',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  caloriesContainer: {},
  caloriesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressTrack: {
    height: 8,
    width: '100%',
    backgroundColor: '#323232',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default NutritionSummary;

