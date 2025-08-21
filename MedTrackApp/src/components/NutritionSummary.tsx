import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Macro = {
  consumed: number;
  target: number;
};

export type Calories = {
  consumed: number;
  target?: number;
};

export type NutritionSummaryProps = {
  protein: Macro;
  fat: Macro;
  carbs: Macro;
  calories: Calories;
};

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  protein,
  fat,
  carbs,
  calories,
}) => {
  const percent = calories.target
    ? Math.round((calories.consumed / calories.target) * 100)
    : 0;

  let barColor = '#22C55E';
  if (percent === 100) {
    barColor = '#F59E0B';
  } else if (percent > 100) {
    barColor = '#EF4444';
  }

  const barWidth = calories.target
    ? `${Math.min(percent, 100)}%`
    : '0%';

  const calorieText = calories.target
    ? `${calories.consumed}/${calories.target} kcal (${percent}%)`
    : '—';

  return (
    <View style={styles.grid}>
      <View style={[styles.cell, styles.borderRight, styles.borderBottom]}>
        <Text style={styles.cellText}>
          Protein → {protein.consumed}/{protein.target} g
        </Text>
      </View>
      <View style={[styles.cell, styles.borderBottom]}>
        <Text style={styles.cellText}>
          Fat → {fat.consumed}/{fat.target} g
        </Text>
      </View>
      <View style={[styles.cell, styles.borderRight]}>
        <Text style={styles.cellText}>
          Carbs → {carbs.consumed}/{carbs.target} g
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>Calories → {calorieText}</Text>
        <View style={styles.progressBarBackground}>
          {calories.target && (
            <View
              style={[styles.progressBarFill, { width: barWidth, backgroundColor: barColor }]}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cell: {
    width: '50%',
    padding: 10,
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: '#333',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  cellText: {
    color: 'white',
    fontSize: 14,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
});

export default NutritionSummary;

