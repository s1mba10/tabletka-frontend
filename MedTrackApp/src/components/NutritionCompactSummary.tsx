import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type NutritionCompactSummaryProps = {
  totals: { calories: number; protein: number; fat: number; carbs: number };
  targets?: { calories: number; protein: number; fat: number; carbs: number };
};

const NutritionCompactSummary: React.FC<NutritionCompactSummaryProps> = ({ totals, targets }) => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const isRussian = locale.startsWith('ru');
  const labels = isRussian
    ? { protein: 'Б', fat: 'Ж', carbs: 'У' }
    : { protein: 'P', fat: 'F', carbs: 'C' };

  const metrics = [
    { key: 'protein', label: labels.protein, total: totals.protein, target: targets?.protein, unit: 'g' },
    { key: 'fat', label: labels.fat, total: totals.fat, target: targets?.fat, unit: 'g' },
    { key: 'carbs', label: labels.carbs, total: totals.carbs, target: targets?.carbs, unit: 'g' },
  ];

  const calorieTarget = targets?.calories;
  const percentage = calorieTarget ? (totals.calories / calorieTarget) * 100 : 0;
  const displayPercentage = calorieTarget ? Math.round(percentage) : 0;
  const fillPercent = calorieTarget ? Math.min(percentage, 100) : 0;

  let barColor = '#22C55E';
  if (percentage > 100) {
    barColor = percentage > 120 ? '#EF4444' : '#F59E0B';
  }

  const textColor = percentage > 100 ? 'black' : 'white';
  const percentageText = calorieTarget ? `${displayPercentage}%` : '—';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {metrics.map((m, idx) => (
          <React.Fragment key={m.key}>
            <Text style={styles.metricText}>
              <Text style={styles.metricLabel}>{m.label} </Text>
              <Text style={styles.metricValue}>{m.total}/{m.target ?? '—'} {m.unit}</Text>
            </Text>
            <Text style={styles.bullet}>•</Text>
          </React.Fragment>
        ))}
        <Text style={styles.metricText}>
          <Text style={styles.metricValue}>{totals.calories}/{targets?.calories ?? '—'} kcal</Text>
        </Text>
      </View>
      <View style={styles.progressContainer}>
        {calorieTarget && (
          <View style={[styles.progressFill, { width: `${fillPercent}%`, backgroundColor: barColor }]} />
        )}
        <Text
          style={[
            styles.progressText,
            { color: calorieTarget ? textColor : '#888' },
          ]}
        >
          {percentageText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricText: {
    fontSize: 12,
    color: 'white',
  },
  metricLabel: {
    color: '#AAA',
    fontWeight: '400',
  },
  metricValue: {
    fontWeight: '700',
    color: 'white',
  },
  bullet: {
    marginHorizontal: 6,
    color: '#666',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 4,
    marginTop: 4,
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    right: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NutritionCompactSummary;

