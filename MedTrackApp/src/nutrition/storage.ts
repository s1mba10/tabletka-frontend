import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FavoriteItem,
  RecentItem,
  UserCatalogItem,
  MealType,
  NormalizedEntry,
} from './types';
import { STORAGE_KEYS } from '../constants/storageKeys';

export type DiaryData = Record<string, Record<MealType, NormalizedEntry[]>>;

export async function loadFavorites(): Promise<FavoriteItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveFavorites(items: FavoriteItem[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_FAVORITES, JSON.stringify(items));
    return true;
  } catch (e) {
    return false;
  }
}

export async function loadRecents(): Promise<RecentItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_RECENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveRecents(items: RecentItem[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_RECENTS, JSON.stringify(items));
  } catch (e) {}
}

export async function addRecent(item: RecentItem) {
  const items = await loadRecents();
  const updated = [item, ...items];
  if (updated.length > 50) updated.splice(50);
  await saveRecents(updated);
}

export async function loadUserCatalog(): Promise<UserCatalogItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_USER_CATALOG);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveUserCatalog(items: UserCatalogItem[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_USER_CATALOG, JSON.stringify(items));
  } catch (e) {}
}

export async function loadDiary(): Promise<DiaryData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_DIARY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export async function saveDiary(data: DiaryData): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION_DIARY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}
