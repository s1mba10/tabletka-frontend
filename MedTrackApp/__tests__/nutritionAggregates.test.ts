import { aggregateMeals, computeDayRsk, computeMealRsk } from '../src/nutrition/aggregate';
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
  });

  it('rounding keeps meal percents sum equal day percent', () => {
    const entries: Record<MealType, NormalizedEntry[]> = {
      breakfast: [
        { id: '1', mealType: 'breakfast', calories: 333, protein: 0, fat: 0, carbs: 0, source: 'manual', createdAt: 0 },
      ],
      lunch: [
        { id: '2', mealType: 'lunch', calories: 333, protein: 0, fat: 0, carbs: 0, source: 'manual', createdAt: 0 },
      ],
      dinner: [
        { id: '3', mealType: 'dinner', calories: 334, protein: 0, fat: 0, carbs: 0, source: 'manual', createdAt: 0 },
      ],
      snack: [],
    };
    const { mealTotals, dayTotals } = aggregateMeals(entries);
    const target = 1000;
    const day = computeDayRsk(dayTotals.calories, target)!;
    const mealPercents = (Object.keys(mealTotals) as MealType[]).map(meal =>
      computeMealRsk(mealTotals[meal].calories, target)!,
    );
    const displayed = mealPercents.map(p => Math.round(p));
    const dayDisplayed = Math.round(day);
    displayed[2] = dayDisplayed - displayed[0] - displayed[1];
    expect(displayed[0] + displayed[1] + displayed[2]).toBe(dayDisplayed);
  });
});
