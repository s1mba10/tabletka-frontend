export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type CatalogItem = {
  id: string;
  name: string;
  brand?: string;
  per100g: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

export type FavoriteItem = {
  id: string;
  sourceId?: string;
  name: string;
  defaultPortionGrams?: number;
  per100g?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  createdAt: number;
};

export type CompositeIngredient = {
  ref: { kind: 'catalog' | 'userCatalog'; id: string };
  name: string;
  per100g: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  grams: number;
};

export type UserCatalogItem = {
  id: string;
  type?: 'single' | 'composite';
  name: string;
  per100g: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  photoUri?: string;
  dishWeight?: number;
  portionWeight?: number;
  ingredients?: CompositeIngredient[];
  createdAt: number;
};

export type RecentItem = {
  id: string;
  name: string;
  portionGrams?: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  createdAt: number;
};

export type NormalizedEntry = {
  id: string;
  mealType: MealType;
  name?: string;
  note?: string;
  portionGrams?: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  source: 'search-catalog' | 'search-saved' | 'favorite' | 'recent' | 'manual';
  sourceRefId?: string;
  createdAt: number;
};

export type AddFoodModalProps = {
  mealType: MealType;
  onCancel: () => void;
  onConfirm: (entry: NormalizedEntry) => void;
  dayTotals?: { calories: number; protein: number; fat: number; carbs: number };
  dayTargets?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
};
