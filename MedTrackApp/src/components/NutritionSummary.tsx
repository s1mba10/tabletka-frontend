import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type NutritionSummaryProps = {
  proteinConsumed?: number;
  proteinTarget?: number;
  fatConsumed?: number;
  fatTarget?: number;
  carbsConsumed?: number;
  carbsTarget?: number;
  caloriesConsumed?: number;
  caloriesTarget?: number;
};

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  proteinConsumed,
  proteinTarget,
  fatConsumed,
  fatTarget,
  carbsConsumed,
  carbsTarget,
  caloriesConsumed,
  caloriesTarget,
}) => {
  const formatMetric = (
    consumed?: number,
    target?: number,
    unit: string = 'г',
  ) => {
    const c = consumed ?? '—';
    const t = target != null ? `${target}${unit}` : '—';
    return `${c}/${t}`;
  };

  const targetDefined = caloriesTarget != null && caloriesTarget > 0;
  const percent =
    targetDefined && caloriesConsumed != null
      ? (caloriesConsumed / caloriesTarget) * 100
      : 0;
  const percentText = targetDefined ? `${Math.round(percent)}%` : '—';

  let barColor = '#22C55E';
  if (percent > 120) barColor = '#EF4444';
  else if (percent > 100) barColor = '#F59E0B';

  const progressWidth = targetDefined ? Math.min(percent, 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.rowText}>
        {`Белки ${formatMetric(proteinConsumed, proteinTarget)} • Жиры ${formatMetric(fatConsumed, fatTarget)} • Углеводы ${formatMetric(carbsConsumed, carbsTarget)} • Ккал ${formatMetric(caloriesConsumed, caloriesTarget, '')}`}
      </Text>
      <View style={styles.progressWrapper}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressWidth}%`, backgroundColor: barColor },
            ]}
          />
        </View>
        <Text testID="calorie-percent" style={styles.percentText}>
          {percentText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  rowText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  percentText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default NutritionSummary;

