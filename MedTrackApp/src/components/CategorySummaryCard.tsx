import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type CategorySummaryCardProps = {
  icon: string;
  percentage: number;
  status: string;
  color: string;
};

const CategorySummaryCard: React.FC<CategorySummaryCardProps> = ({
  icon,
  percentage,
  status,
  color,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
      <Text style={[styles.status, { color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  percentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default CategorySummaryCard;
