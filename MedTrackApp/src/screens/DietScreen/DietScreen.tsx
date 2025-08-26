import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Platform, ToastAndroid, Alert } from 'react-native';
import { format, addDays } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { NutritionCalendar, MacronutrientSummary, MealPanel } from '../../components';
import AddFoodModal from '../../components/AddFoodModal';
import { MealType, NormalizedEntry } from '../../nutrition/types';
import { RootStackParamList } from '../../navigation';
import { aggregateMeals, computeRskPercents } from '../../nutrition/aggregate';
import { formatNumber } from '../../utils/number';
import { styles } from './styles';

type NavProp = StackNavigationProp<RootStackParamList, 'Diet'>;

const DietScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );

  const navigation = useNavigation<NavProp>();

  const createEmptyDay = (): Record<MealType, NormalizedEntry[]> => ({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  const [entriesByDate, setEntriesByDate] = useState<
    Record<string, Record<MealType, NormalizedEntry[]>>
  >({});
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);

  const dayEntries = entriesByDate[selectedDate] || createEmptyDay();

  const mealMeta: Record<MealType, { title: string; icon: string }> = {
    breakfast: { title: 'Завтрак', icon: '🌅' },
    lunch: { title: 'Обед', icon: '☀️' },
    dinner: { title: 'Ужин', icon: '🌇' },
    snack: { title: 'Перекус/Другое', icon: '🌙' },
  };

  const targetCalories = 3300; // mock target

  const { mealTotals, dayTotals } = useMemo(
    () => aggregateMeals(dayEntries),
    [dayEntries],
  );

  const rsk = computeRskPercents(
    {
      breakfast: mealTotals.breakfast.calories,
      lunch: mealTotals.lunch.calories,
      dinner: mealTotals.dinner.calories,
      snack: mealTotals.snack.calories,
    },
    targetCalories,
  );

  const dayRskDisplay = rsk?.day;
  const mealRskDisplay: Record<MealType, number | undefined> = rsk
    ? rsk.byMeal
    : { breakfast: undefined, lunch: undefined, dinner: undefined, snack: undefined };

  const meals = useMemo(
    () =>
      (Object.keys(mealMeta) as MealType[]).map(key => ({
        mealKey: key,
        icon: mealMeta[key].icon,
        title: mealMeta[key].title,
        totalCalories: mealTotals[key].calories,
        fat: mealTotals[key].fat,
        carbs: mealTotals[key].carbs,
        protein: mealTotals[key].protein,
        rskPercent: mealRskDisplay[key],
        entries: dayEntries[key].map(e => ({
          id: e.id,
          name: e.name || '',
          amount: e.portionGrams ? `${formatNumber(e.portionGrams)} г` : undefined,
          calories: e.calories,
          fat: e.fat,
          carbs: e.carbs,
          protein: e.protein,
        })),
      })),
    [dayEntries, mealMeta, mealTotals, mealRskDisplay],
  );

  const getHasFoodByDate = (date: string) => {
    const day = entriesByDate[date];
    if (!day) return false;
    return (Object.values(day) as NormalizedEntry[][]).some(arr => arr.length > 0);
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const handleCopyFromYesterday = (date: string) => {
    const yDate = format(addDays(new Date(date), -1), 'yyyy-MM-dd');
    setEntriesByDate(prev => {
      const copy = prev[yDate] ? { ...prev[yDate] } : createEmptyDay();
      return { ...prev, [date]: copy };
    });
    showToast('Записи скопированы');
  };

  const handleClearDay = (date: string) => {
    setEntriesByDate(prev => ({ ...prev, [date]: createEmptyDay() }));
    showToast('Все записи удалены');
  };

  const handleConfirm = (entry: NormalizedEntry) => {
    setEntriesByDate(prev => {
      const day = prev[selectedDate] || createEmptyDay();
      const updated = {
        ...day,
        [entry.mealType]: [...day[entry.mealType], entry],
      };
      return { ...prev, [selectedDate]: updated };
    });
    showToast(`Добавлено в ${mealMeta[entry.mealType].title}`);
    setActiveMeal(null);
  };

  const handleSelectEntry = (meal: MealType, id: string) => {
    const entry = dayEntries[meal].find(e => e.id === id);
    if (!entry) return;
    navigation.navigate('FoodEdit', {
      entry,
      onSave: updated => {
        setEntriesByDate(prev => {
          const day = prev[selectedDate] || createEmptyDay();
          const mealArr = day[updated.mealType].map(e =>
            e.id === updated.id ? updated : e,
          );
          const updatedDay = { ...day, [updated.mealType]: mealArr };
          return { ...prev, [selectedDate]: updatedDay };
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <NutritionCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          getHasFoodByDate={getHasFoodByDate}
          onCopyFromYesterday={handleCopyFromYesterday}
          onClearDay={handleClearDay}
        />
        <MacronutrientSummary
          caloriesConsumed={dayTotals.calories}
          rskPercent={dayRskDisplay}
          protein={dayTotals.protein}
          fat={dayTotals.fat}
          carbs={dayTotals.carbs}
        />
        {meals.map(meal => (
          <MealPanel
            key={meal.mealKey}
            {...meal}
            onAdd={() => setActiveMeal(meal.mealKey)}
            onSelectEntry={id => handleSelectEntry(meal.mealKey, id)}
          />
        ))}
      </ScrollView>
      {activeMeal && (
        <AddFoodModal
          mealType={activeMeal}
          onCancel={() => setActiveMeal(null)}
          onConfirm={handleConfirm}
          dayTotals={dayTotals}
          dayTargets={{ calories: targetCalories }}
        />
      )}
    </SafeAreaView>
  );
};

export default DietScreen;

