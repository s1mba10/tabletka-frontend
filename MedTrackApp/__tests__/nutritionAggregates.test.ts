import {
  aggregateMeals,
  computeDayRsk,
  computeMealRsk,
  computeRskPercents,
} from '../src/nutrition/aggregate';
import { MealType, NormalizedEntry } from '../src/nutrition/types';

describe('nutrition aggregates', () => {
  const emptyMeals: Record<MealType, NormalizedEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  it('handles empty day', () => {
    const { mealTotals, dayTotals } = aggregateMeals(emptyMeals);
    expect(dayTotals).toEqual({ calories: 0, protein: 0, fat: 0, carbs: 0 });
    Object.values(mealTotals).forEach(t =>
      expect(t).toEqual({ calories: 0, protein: 0, fat: 0, carbs: 0 }),
    );
  });

  it('computes totals and percentages', () => {
    const entries: Record<MealType, NormalizedEntry[]> = {
      ...emptyMeals,
      breakfast: [
        {
          id: '1',
          mealType: 'breakfast',
          calories: 300,
          protein: 10,
          fat: 20,
          carbs: 30,
          source: 'manual',
          createdAt: Date.now(),
        },
      ],
      dinner: [
        {
          id: '2',
          mealType: 'dinner',
          calories: 700,
          protein: 40,
          fat: 30,
          carbs: 20,
          source: 'manual',
          createdAt: Date.now(),
        },
      ],
    };
    const { mealTotals, dayTotals } = aggregateMeals(entries);
    expect(dayTotals.calories).toBe(1000);
    expect(mealTotals.breakfast.calories).toBe(300);
    expect(mealTotals.dinner.calories).toBe(700);
    const dayPct = computeDayRsk(dayTotals.calories, 2000);
    const mealPct = computeMealRsk(mealTotals.breakfast.calories, 2000);
    expect(dayPct).toBeCloseTo(50);
    expect(mealPct).toBeCloseTo(15);
  });

  it('returns null percentages when target missing', () => {
    expect(computeDayRsk(500, undefined)).toBeNull();
    expect(computeMealRsk(200, null)).toBeNull();
    expect(
      computeRskPercents({ breakfast: 0, lunch: 0, dinner: 0, snack: 0 }, 0),
    ).toBeNull();
  });

  it('rounds meal percents and keeps total equal to day percent', () => {
    const mealCal = { breakfast: 24, lunch: 64, dinner: 0, snack: 0 };
    const res = computeRskPercents(mealCal, 1000)!;
    expect(res.day).toBe(9);
    expect(res.byMeal).toEqual({ breakfast: 2, lunch: 7, dinner: 0, snack: 0 });
  });

  it('assigns remainder to the last non-empty meal', () => {
    const mealCal = { breakfast: 26, lunch: 0, dinner: 26, snack: 0 };
    const res = computeRskPercents(mealCal, 1000)!;
    expect(res.day).toBe(5);
    expect(res.byMeal).toEqual({ breakfast: 3, lunch: 0, dinner: 2, snack: 0 });
  });
});
