import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { format } from 'date-fns';

import { NutritionCalendar, NutritionCompactSummary } from '../../components';
import { styles } from './styles';

const DietScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );

  const mockFoodDates = new Set([
    '2025-08-18',
    '2025-08-20',
    '2025-08-22',
  ]);

  const getHasFoodByDate = (date: string) => mockFoodDates.has(date);

  const totals = { calories: 1200, protein: 45, fat: 60, carbs: 150 };
  const targets = { calories: 2000, protein: 120, fat: 70, carbs: 250 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <NutritionCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          getHasFoodByDate={getHasFoodByDate}
        />
        <NutritionCompactSummary totals={totals} targets={targets} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DietScreen;
