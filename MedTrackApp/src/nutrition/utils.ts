import { MealType, NormalizedEntry } from './types';

/**
 * Creates an empty day structure with all meal types initialized to empty arrays
 */
export const createEmptyDay = (): Record<MealType, NormalizedEntry[]> => ({
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
});
