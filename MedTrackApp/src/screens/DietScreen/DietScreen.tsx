import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { NutritionCalendar } from '../../components';
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
    </SafeAreaView>
  );
};

export default DietScreen;
