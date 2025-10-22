/**
 * Централизованное хранилище ключей для AsyncStorage
 * Все ключи собраны в одном месте для удобства управления и предотвращения ошибок
 */

export const STORAGE_KEYS = {
  // Authentication
  AUTH_IS_AUTHENTICATED: 'auth:isAuthenticated',
  AUTH_PROFILE: 'auth:profile',
  AUTH_PENDING_EMAIL: 'auth:pendingEmail',

  // Medications
  MEDICATIONS: 'medications',
  COURSES: 'courses',
  REMINDERS: 'reminders',

  // Nutrition
  NUTRITION_FAVORITES: 'nutrition:favorites:v1',
  NUTRITION_RECENTS: 'nutrition:recents:v1',
  NUTRITION_USER_CATALOG: 'nutrition:userCatalog:v1',
  NUTRITION_DIARY: 'nutrition:diary:v1',

  // Water tracking
  WATER_BY_DATE: 'diet.waterByDate.v1',
  WATER_TOTAL: 'settings.waterTotal.v1',

  // Profile
  USER_PROFILE: 'userProfile',
} as const;

// Экспорт типа для использования в других местах
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
