import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_KEY = 'nutrition:favorites:v1';
export const RECENTS_KEY = 'nutrition:recents:v1';

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

export const getFavorites = async (): Promise<FavoriteItem[]> => {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
};

export const saveFavorites = async (items: FavoriteItem[]) => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
};

export const getRecents = async (): Promise<RecentItem[]> => {
  const raw = await AsyncStorage.getItem(RECENTS_KEY);
  return raw ? (JSON.parse(raw) as RecentItem[]) : [];
};

export const saveRecents = async (items: RecentItem[]) => {
  await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(items.slice(0, 50)));
};

export const addRecent = async (item: RecentItem) => {
  const list = await getRecents();
  list.unshift(item);
  await saveRecents(list);
};
