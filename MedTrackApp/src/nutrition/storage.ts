import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FavoriteItem,
  RecentItem,
  UserCatalogItem,
  MealType,
  NormalizedEntry,
} from './types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { NUTRITION_DEFAULTS } from '../constants/nutritionDefaults';

export type DiaryData = Record<string, Record<MealType, NormalizedEntry[]>>;

export async function loadFavorites(): Promise<FavoriteItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
}

export async function saveFavorites(items: FavoriteItem[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_FAVORITES, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Failed to save favorites:', error);
    return false;
  }
}

export async function loadRecents(): Promise<RecentItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_RECENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load recents:', error);
    return [];
  }
}

export async function saveRecents(items: RecentItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_RECENTS, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save recents:', error);
  }
}

export async function addRecent(item: RecentItem) {
  const items = await loadRecents();
  const updated = [item, ...items];
  if (updated.length > NUTRITION_DEFAULTS.MAX_RECENT_ITEMS) {
    updated.splice(NUTRITION_DEFAULTS.MAX_RECENT_ITEMS);
  }
  await saveRecents(updated);
}

export async function loadUserCatalog(): Promise<UserCatalogItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_USER_CATALOG);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load user catalog:', error);
    return [];
  }
}

/**
 * Оптимизированная загрузка всех nutrition данных за один I/O запрос
 */
export async function loadAllNutritionData(): Promise<{
  favorites: FavoriteItem[];
  recents: RecentItem[];
  userCatalog: UserCatalogItem[];
}> {
  try {
    const [[, favoritesRaw], [, recentsRaw], [, catalogRaw]] = await AsyncStorage.multiGet([
      STORAGE_KEYS.NUTRITION_FAVORITES,
      STORAGE_KEYS.NUTRITION_RECENTS,
      STORAGE_KEYS.NUTRITION_USER_CATALOG,
    ]);

    return {
      favorites: favoritesRaw ? JSON.parse(favoritesRaw) : [],
      recents: recentsRaw ? JSON.parse(recentsRaw) : [],
      userCatalog: catalogRaw ? JSON.parse(catalogRaw) : [],
    };
  } catch (error) {
    console.error('Failed to load nutrition data:', error);
    return {
      favorites: [],
      recents: [],
      userCatalog: [],
    };
  }
}

export async function saveUserCatalog(items: UserCatalogItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_USER_CATALOG, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save user catalog:', error);
  }
}

export async function loadDiary(): Promise<DiaryData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_DIARY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to load diary:', error);
    return {};
  }
}

export async function saveDiary(data: DiaryData): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_DIARY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save diary:', error);
    return false;
  }
}
