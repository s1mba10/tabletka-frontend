// screens/diet/DietScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import WaterTracker from '../../components/WaterTracker';
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ScrollView,
  Platform,
  ToastAndroid,
  Alert,
  Pressable,
  StyleSheet,
  View,
  StatusBar,
  InteractionManager,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { format, addDays } from 'date-fns';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { NutritionCalendar, MacronutrientSummary, MealPanel } from '../../components';
import AddFoodModal from '../../components/AddFoodModal';
import { MealType, NormalizedEntry } from '../../nutrition/types';
import { RootStackParamList } from '../../navigation';
import { aggregateMeals, computeRskPercents } from '../../nutrition/aggregate';
import { formatNumber } from '../../utils/number';
import { styles } from './styles';
import { loadDiary, saveDiary } from '../../nutrition/storage';

type NavProp = StackNavigationProp<RootStackParamList, 'Diet'>;

const DietScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const navigation = useNavigation<NavProp>();
  const [weekOffset, setWeekOffset] = useState(0);
  const lastNavTime = useRef(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const waterYRef = useRef(0);
  const route = useRoute<RouteProp<RootStackParamList, 'Diet'>>();

  // ---- ДНЕВНИК ПРИЁМОВ ПИЩИ ----
  const createEmptyDay = (): Record<MealType, NormalizedEntry[]> => ({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  const [entriesByDate, setEntriesByDate] = useState<
    Record<string, Record<MealType, NormalizedEntry[]>>
  >({});
  const isLoaded = useRef(false);
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);

  const dayEntries = entriesByDate[selectedDate] || createEmptyDay();

  const mealMeta: Record<MealType, { title: string; icon: string }> = {
    breakfast: { title: 'Завтрак', icon: '🌅' },
    lunch: { title: 'Обед', icon: '☀️' },
    dinner: { title: 'Ужин', icon: '🌇' },
    snack: { title: 'Перекус/Другое', icon: '🌙' },
  };

  const targetCalories = 3300; // mock target

  const { mealTotals, dayTotals } = useMemo(() => aggregateMeals(dayEntries), [dayEntries]);

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
    if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
    else Alert.alert(message);
  };

  const handleCopyFromYesterday = (date: string) => {
    const yDate = format(addDays(new Date(date), -1), 'yyyy-MM-dd');
    setEntriesByDate(prev => {
      const copy = prev[yDate]
        ? {
            breakfast: [...prev[yDate].breakfast],
            lunch: [...prev[yDate].lunch],
            dinner: [...prev[yDate].dinner],
            snack: [...prev[yDate].snack],
          }
        : createEmptyDay();
      return { ...prev, [date]: copy };
    });
    showToast('Записи скопированы');
  };

  const handleCopyMealFromYesterday = (meal: MealType) => {
    const yDate = format(addDays(new Date(selectedDate), -1), 'yyyy-MM-dd');
    const prevMeal = entriesByDate[yDate]?.[meal] || [];
    const mealName = mealMeta[meal].title;

    if (prevMeal.length === 0) {
      Alert.alert('Нет записей за вчера', `Во вчерашнем ${mealName} нет продуктов для копирования.`, [
        { text: 'Понятно' },
      ]);
      return;
    }

    Alert.alert(
      'Скопировать из вчера?',
      `Продукты из вчерашнего ${mealName} будут ДОБАВЛЕНЫ к сегодняшнему ${mealName}. Текущие записи сохранятся.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Добавить',
          onPress: () => {
            setEntriesByDate(prev => {
              const day = prev[selectedDate] || createEmptyDay();
              const updated = {
                ...day,
                [meal]: [
                  ...day[meal],
                  ...prevMeal.map(e => ({
                    ...e,
                    id: Math.random().toString(),
                    createdAt: Date.now(),
                    mealType: meal,
                  })),
                ],
              };
              return { ...prev, [selectedDate]: updated };
            });
            showToast('Скопировано');
          },
        },
      ],
    );
  };

  const handleClearMeal = (meal: MealType) => {
    const mealName = mealMeta[meal].title;
    const day = entriesByDate[selectedDate] || createEmptyDay();

    if (day[meal].length === 0) {
      showToast('Записей нет');
      return;
    }

    Alert.alert('Очистить приём пищи?', `Все продукты из ${mealName} будут удалены.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Очистить',
        style: 'destructive',
        onPress: () => {
          setEntriesByDate(prev => {
            const day = prev[selectedDate] || createEmptyDay();
            const updated = { ...day, [meal]: [] };
            return { ...prev, [selectedDate]: updated };
          });
          showToast('Очищено');
        },
      },
    ]);
  };

  const handleClearDay = (date: string) => {
    setEntriesByDate(prev => ({ ...prev, [date]: createEmptyDay() }));
    showToast('Все записи удалены');
  };

  const handleConfirm = (entry: NormalizedEntry) => {
    setEntriesByDate(prev => {
      const day = prev[selectedDate] || createEmptyDay();
      const updated = { ...day, [entry.mealType]: [...day[entry.mealType], entry] };
      return { ...prev, [selectedDate]: updated };
    });
  };

  const handleSelectEntry = (meal: MealType, id: string) => {
    navigation.navigate('FoodEdit', { date: selectedDate, meal, entryId: id });
  };

  // ---- ВОДА (стаканы) ----
  const [waterByDate, setWaterByDate] = useState<Record<string, number>>({});
  const waterForSelected = waterByDate[selectedDate] ?? 0;
  const WATER_KEY = 'diet.waterByDate.v1';

  // дневная цель по воде (кол-во стаканов)
  const WATER_TOTAL_KEY = 'settings.waterTotal.v1';
  const [dailyWaterTotal, setDailyWaterTotal] = useState<number>(10);

  const handleWaterChange = (next: number) => {
    setWaterByDate(prev => ({ ...prev, [selectedDate]: next }));
  };

  const handleChangeDailyWaterTotal = (nextTotal: number) => {
    setDailyWaterTotal(nextTotal);
    AsyncStorage.setItem(WATER_TOTAL_KEY, String(nextTotal)).catch(() => {});
    // если текущие стаканы больше новой цели — обрежем
    setWaterByDate(prev => {
      const curr = prev[selectedDate] ?? 0;
      if (curr > nextTotal) {
        return { ...prev, [selectedDate]: nextTotal };
      }
      return prev;
    });
  };

  // ---- Загрузка данных ----
  useEffect(() => {
    loadDiary()
      .then(data => {
        setEntriesByDate(data);
        isLoaded.current = true;
      })
      .catch(() => showToast('Не удалось загрузить данные'));

    AsyncStorage.getItem(WATER_KEY)
      .then(raw => setWaterByDate(raw ? JSON.parse(raw) : {}))
      .catch(() => {});

    AsyncStorage.getItem(WATER_TOTAL_KEY)
      .then(raw => {
        const parsed = raw ? parseInt(raw, 10) : NaN;
        if (!Number.isNaN(parsed) && parsed > 0) setDailyWaterTotal(parsed);
      })
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDiary()
        .then(data => {
          setEntriesByDate(data);
          isLoaded.current = true;
        })
        .catch(() => showToast('Не удалось загрузить данные'));

      AsyncStorage.getItem(WATER_KEY)
        .then(raw => setWaterByDate(raw ? JSON.parse(raw) : {}))
        .catch(() => {});

      AsyncStorage.getItem(WATER_TOTAL_KEY)
        .then(raw => {
          const parsed = raw ? parseInt(raw, 10) : NaN;
          if (!Number.isNaN(parsed) && parsed > 0) setDailyWaterTotal(parsed);
        })
        .catch(() => {});
    }, []),
  );

  // ---- Сохранение данных ----
  useEffect(() => {
    if (!isLoaded.current) return;
    saveDiary(entriesByDate).then(ok => {
      if (!ok) showToast('Не удалось сохранить изменения');
    });
  }, [entriesByDate]);

  useEffect(() => {
    AsyncStorage.setItem(WATER_KEY, JSON.stringify(waterByDate)).catch(() => {});
  }, [waterByDate]);

  const handleSummaryPress = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTime.current < 500) return;
    lastNavTime.current = now;
    navigation.navigate('NutritionStats', { selectedDate });
  }, [navigation, selectedDate]);

  // динамический верхний inset только на Android при прозрачном статус-баре
  const androidTopPad = Platform.OS === 'android' ? Math.max(insets.top, 8) : 0;
  const onWaterLayout = useCallback((event: LayoutChangeEvent) => {
    waterYRef.current = event.nativeEvent.layout.y ?? 0;
  }, []);

  // Плавный и надёжный автоскролл
  const tryScrollToWater = useCallback(() => {
    const y = Math.max(0, waterYRef.current - 12);
    scrollRef.current?.scrollTo({ y, animated: true });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.jumpTo === 'water') {
        let cancelled = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 4;

        const run = () => {
          if (cancelled) return;
          attempts += 1;
          tryScrollToWater();
          if (attempts < MAX_ATTEMPTS) {
            setTimeout(run, 100);
          } else {
            navigation.setParams({ jumpTo: undefined });
          }
        };

        InteractionManager.runAfterInteractions(() => {
          if (cancelled) return;
          setTimeout(run, 50);
        });

        return () => {
          cancelled = true;
        };
      }

      return undefined;
    }, [route.params?.jumpTo, navigation, tryScrollToWater]),
  );

  return (
    <>
      {/* Прозрачный статус-бар + светлый текст */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* iOS: top+bottom, Android: только bottom (верх — вручную по insets.top) */}
      <SafeAreaView
        edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
        style={[styles.container, fixStyles.noInsets]}
      >
        <View style={{ paddingTop: androidTopPad, flex: 1 }}>
          <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, fixStyles.contentPad]}>
            <NutritionCalendar
              value={selectedDate}
              onChange={setSelectedDate}
              getHasFoodByDate={getHasFoodByDate}
              onCopyFromYesterday={handleCopyFromYesterday}
              onClearDay={handleClearDay}
              onPrevWeek={() => setWeekOffset(w => w - 1)}
              onNextWeek={() => setWeekOffset(w => w + 1)}
            />

            <Pressable
              onPress={handleSummaryPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Открыть статистику питания"
              accessibilityHint="Нажмите, чтобы открыть расширенную статистику питания за неделю."
              android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              pointerEvents="auto"
              testID="diet-summary-pressable"
            >
              <View>
                <MacronutrientSummary
                  caloriesConsumed={dayTotals.calories}
                  targetCalories={targetCalories}
                  rskPercent={dayRskDisplay}
                  protein={dayTotals.protein}
                  fat={dayTotals.fat}
                  carbs={dayTotals.carbs}
                />
              </View>
            </Pressable>

            {meals.map(meal => (
              <MealPanel
                key={meal.mealKey}
                {...meal}
                onAdd={() => setActiveMeal(meal.mealKey)}
                onSelectEntry={id => handleSelectEntry(meal.mealKey, id)}
                onCopyFromYesterday={() => handleCopyMealFromYesterday(meal.mealKey)}
                onClearMeal={() => handleClearMeal(meal.mealKey)}
              />
            ))}

            {/* === Трекер воды === */}
            <View onLayout={onWaterLayout}>
              <WaterTracker
                value={waterForSelected}
                total={dailyWaterTotal}
                onChange={handleWaterChange}
                onChangeTotal={handleChangeDailyWaterTotal}
              />
            </View>
          </ScrollView>
        </View>

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
    </>
  );
};

export default DietScreen;

const fixStyles = StyleSheet.create({
  noInsets: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  contentPad: {
    paddingBottom: 16,
  },
});

const summaryStyles = StyleSheet.create({
  chevron: {
    position: 'absolute',
    right: 4,
    top: '50%',
    marginTop: -8,
    pointerEvents: 'none',
  },
});