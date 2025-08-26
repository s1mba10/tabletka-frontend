import { MealType, NormalizedEntry } from './types';

export type Nutrients = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

const emptyTotals = (): Nutrients => ({
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
});

export const aggregateMeals = (
  entriesByMeal: Record<MealType, NormalizedEntry[]>,
): { mealTotals: Record<MealType, Nutrients>; dayTotals: Nutrients } => {
  const mealTotals: Record<MealType, Nutrients> = {
    breakfast: emptyTotals(),
    lunch: emptyTotals(),
    dinner: emptyTotals(),
    snack: emptyTotals(),
  };

  (Object.keys(entriesByMeal) as MealType[]).forEach(meal => {
    entriesByMeal[meal]?.forEach(e => {
      mealTotals[meal].calories += e.calories;
      mealTotals[meal].protein += e.protein;
      mealTotals[meal].fat += e.fat;
      mealTotals[meal].carbs += e.carbs;
    });
  });

  const dayTotals = emptyTotals();
  (Object.keys(mealTotals) as MealType[]).forEach(meal => {
    dayTotals.calories += mealTotals[meal].calories;
    dayTotals.protein += mealTotals[meal].protein;
    dayTotals.fat += mealTotals[meal].fat;
    dayTotals.carbs += mealTotals[meal].carbs;
  });

  return { mealTotals, dayTotals };
};

export const computeDayRsk = (
  dayCal: number,
  targetCal?: number | null,
): number | null => {
  if (!targetCal || targetCal <= 0) return null;
  return (dayCal / targetCal) * 100;
};

export const computeMealRsk = (
  mealCal: number,
  targetCal?: number | null,
): number | null => {
  if (!targetCal || targetCal <= 0) return null;
  return (mealCal / targetCal) * 100;
};

export const computeRskPercents = (
  mealCal: Record<MealType, number>,
  targetCal?: number | null,
): { day: number; byMeal: Record<MealType, number> } | null => {
  if (!targetCal || targetCal <= 0) return null;

  const keys: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const dayCal = keys.reduce((sum, k) => sum + mealCal[k], 0);

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const dayPctShown = clamp(Math.round((dayCal / targetCal) * 100));

  let lastNonEmpty: MealType | null = null;
  keys.forEach(k => {
    if (mealCal[k] > 0) {
      lastNonEmpty = k;
    }
  });

  const result: Record<MealType, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };

  if (lastNonEmpty === null) {
    return { day: dayPctShown, byMeal: result };
  }

  let sumOthers = 0;
  keys.forEach(k => {
    if (mealCal[k] === 0 || k === lastNonEmpty) return;
    const pct = clamp(Math.round((mealCal[k] / targetCal) * 100));
    result[k] = pct;
    sumOthers += pct;
  });

  result[lastNonEmpty] = clamp(Math.max(0, dayPctShown - sumOthers));

  return { day: dayPctShown, byMeal: result };
};

