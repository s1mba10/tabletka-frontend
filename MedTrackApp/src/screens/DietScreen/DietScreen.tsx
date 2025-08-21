import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { NutritionCalendar, MacronutrientSummary } from '../../components';
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

  const mockMacros = {
    calories: { consumed: 1200, target: 2000 },
    protein: { consumed: 45, target: 120 },
    fat: { consumed: 60, target: 70 },
    carbs: { consumed: 150, target: 250 },
  };

  const getHasFoodByDate = (date: string) => mockFoodDates.has(date);

  return (
    <SafeAreaView style={styles.container}>
      <NutritionCalendar
        value={selectedDate}
        onChange={setSelectedDate}
        getHasFoodByDate={getHasFoodByDate}
      />
      <MacronutrientSummary {...mockMacros} />
    </SafeAreaView>
  );
};

export default DietScreen;
