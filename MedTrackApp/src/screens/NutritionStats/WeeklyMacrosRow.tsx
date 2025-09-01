import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatNumber } from '../../utils/number';

interface Totals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Props {
  totals: Totals;
  kcalTarget?: number;
}

const WeeklyMacrosRow: React.FC<Props> = ({ totals, kcalTarget }) => {
  const rskPct = kcalTarget && kcalTarget > 0 ? (totals.calories / (kcalTarget * 7)) * 100 : null;
  const rskDisplay = rskPct === null ? '—%' : `${formatNumber(Math.round(rskPct), 0)}%`;

  return (
    <View style={styles.container}>
      <View
        style={styles.column}
        accessible
        accessibilityLabel={`Жиры за неделю: ${formatNumber(totals.fat, 1)} грамма`}
      >
        <Text style={styles.label}>Жиры</Text>
        <Text style={styles.value}>{formatNumber(totals.fat, 1)}</Text>
      </View>
      <View
        style={styles.column}
        accessible
        accessibilityLabel={`Углеводы за неделю: ${formatNumber(totals.carbs, 1)} грамма`}
      >
        <Text style={styles.label}>Углев</Text>
        <Text style={styles.value}>{formatNumber(totals.carbs, 1)}</Text>
      </View>
      <View
        style={styles.column}
        accessible
        accessibilityLabel={`Белки за неделю: ${formatNumber(totals.protein, 1)} грамма`}
      >
        <Text style={styles.label}>Белк</Text>
        <Text style={styles.value}>{formatNumber(totals.protein, 1)}</Text>
      </View>
      <View
        style={styles.column}
        accessible
        accessibilityLabel={
          rskPct === null
            ? 'РСК за неделю: цель не задана'
            : `РСК за неделю: ${formatNumber(Math.round(rskPct), 0)} процентов`
        }
      >
        <Text style={styles.label}>РСК</Text>
        <Text style={styles.value}>{rskDisplay}</Text>
      </View>
      <View
        style={styles.column}
        accessible
        accessibilityLabel={`Калории за неделю: ${formatNumber(totals.calories, 0)} килокалорий`}
      >
        <Text style={styles.label}>Калории</Text>
        <Text style={styles.value}>{formatNumber(totals.calories, 0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  value: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default WeeklyMacrosRow;

