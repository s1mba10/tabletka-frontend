import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Безопасная загрузка массива из AsyncStorage с обработкой ошибок
 * @param key - ключ хранилища
 * @param defaultValue - значение по умолчанию если данных нет или произошла ошибка
 * @returns Promise с массивом типа T
 */
export async function loadArrayFromStorage<T>(
  key: string,
  defaultValue: T[] = [],
): Promise<T[]> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) {
      return defaultValue;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Безопасное сохранение массива в AsyncStorage с обработкой ошибок
 * @param key - ключ хранилища
 * @param data - данные для сохранения
 * @returns Promise<boolean> - true если сохранение успешно, false при ошибке
 */
export async function saveArrayToStorage<T>(key: string, data: T[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
}

/**
 * Безопасная загрузка объекта из AsyncStorage с обработкой ошибок
 * @param key - ключ хранилища
 * @param defaultValue - значение по умолчанию если данных нет или произошла ошибка
 * @returns Promise с объектом типа T
 */
export async function loadObjectFromStorage<T>(
  key: string,
  defaultValue: T,
): Promise<T> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) {
      return defaultValue;
    }

    const parsed = JSON.parse(stored);
    return parsed !== null && typeof parsed === 'object' ? parsed : defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Безопасное сохранение объекта в AsyncStorage с обработкой ошибок
 * @param key - ключ хранилища
 * @param data - данные для сохранения
 * @returns Promise<boolean> - true если сохранение успешно, false при ошибке
 */
export async function saveObjectToStorage<T>(key: string, data: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
}
