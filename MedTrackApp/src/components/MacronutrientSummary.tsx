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
  const percent = calories.target
    ? Math.round((calories.consumed / calories.target) * 100)
    : undefined;
  const barPercent = percent !== undefined ? Math.min(percent, 100) : 0;
  let barColor = '#22C55E';
  if (percent !== undefined) {
    if (percent > 120) {
      barColor = '#EF4444';
    } else if (percent > 100) {
      barColor = '#F59E0B';
    }
  }

  const summaryText = [
    `Белки ${protein.consumed}/${protein.target ?? '—'}г`,
    `Жиры ${fat.consumed}/${fat.target ?? '—'}г`,
    `Углеводы ${carbs.consumed}/${carbs.target ?? '—'}г`,
    `Ккал ${calories.consumed}/${calories.target ?? '—'}`,
  ].join(' • ');

  return (
    <View style={styles.container}>
      <Text style={styles.summaryText}>{summaryText}</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          {percent !== undefined && (
            <View
              style={[
                styles.progressFill,
                { width: `${barPercent}%`, backgroundColor: barColor },
              ]}
            />
          )}
        </View>
        <Text style={styles.percentage}>
          {percent !== undefined ? `${percent}%` : '—'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#323232',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 12,
  },
});

export default MacronutrientSummary;
