import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type MacronutrientSummaryProps = {
  caloriesConsumed: number;
  caloriesTarget?: number;
  protein: number;
  fat: number;
  carbs: number;
};

const formatNumber = (value: number) =>
  value.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const MacronutrientSummary: React.FC<MacronutrientSummaryProps> = ({
  caloriesConsumed,
  caloriesTarget,
  protein,
  fat,
  carbs,
}) => {
  const percent = caloriesTarget
    ? Math.round((caloriesConsumed / caloriesTarget) * 100)
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

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.column}>
          <Text style={styles.label}>Жиры</Text>
          <Text style={styles.value} testID="summary-fat">
            {formatNumber(fat)}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Углев</Text>
          <Text style={styles.value} testID="summary-carb">
            {formatNumber(carbs)}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Белк</Text>
          <Text style={styles.value} testID="summary-protein">
            {formatNumber(protein)}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>РСК</Text>
          <Text style={styles.value} testID="summary-rsk">
            {percent !== undefined ? `${percent}%` : '—'}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Калории</Text>
          <Text
            style={[styles.value, styles.caloriesValue]}
            testID="summary-calories"
          >
            {formatNumber(caloriesConsumed)}
          </Text>
        </View>
      </View>
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
        <Text style={styles.percentage} testID="summary-bar-pct">
          {percent !== undefined ? `${percent}%` : '—'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginBottom: 2,
  },
  value: {
    color: '#fff',
    fontSize: 12,
  },
  caloriesValue: {
    fontWeight: '700',
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

