import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { NutritionCalendar, NutritionSummary } from '../../components';
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

  return (
    <SafeAreaView style={styles.container}>
      <NutritionCalendar
        value={selectedDate}
        onChange={setSelectedDate}
        getHasFoodByDate={getHasFoodByDate}
      />
      <NutritionSummary
        proteinConsumed={45}
        proteinTarget={120}
        fatConsumed={60}
        fatTarget={70}
        carbsConsumed={150}
        carbsTarget={250}
        caloriesConsumed={1200}
        caloriesTarget={2000}
      />
    </SafeAreaView>
  );
};

export default DietScreen;
