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

