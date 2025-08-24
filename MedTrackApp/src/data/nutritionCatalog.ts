export type CatalogItem = {
  id: string;
  name: string;
  brand?: string;
  per100g: { calories: number; protein: number; fat: number; carbs: number };
};

export const localCatalog: CatalogItem[] = [
  {
    id: 'oatmeal',
    name: 'Овсянка',
    per100g: { calories: 352, protein: 12, fat: 5.8, carbs: 60 },
  },
  {
    id: 'apple',
    name: 'Яблоко',
    per100g: { calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
  },
];
