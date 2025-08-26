import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteItem, RecentItem, UserCatalogItem } from './types';

export const FAVORITES_KEY = 'nutrition:favorites:v1';
export const RECENTS_KEY = 'nutrition:recents:v1';
export const USER_CATALOG_KEY = 'nutrition:userCatalog:v1';

export async function loadFavorites(): Promise<FavoriteItem[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveFavorites(items: FavoriteItem[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    return false;
  }
}

export async function loadRecents(): Promise<RecentItem[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveRecents(items: RecentItem[]) {
  try {
    await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(items));
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
    const raw = await AsyncStorage.getItem(USER_CATALOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveUserCatalog(items: UserCatalogItem[]) {
  try {
    await AsyncStorage.setItem(USER_CATALOG_KEY, JSON.stringify(items));
  } catch (e) {}
}
