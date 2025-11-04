/**
 * Дефолтные значения для питания и целей пользователя
 * TODO: В будущем можно сделать настраиваемыми через профиль пользователя
 */

export const NUTRITION_DEFAULTS = {
  // Дневные цели по калориям и макронутриентам
  DAILY_CALORIES_TARGET_KCAL: 3300,
  DAILY_PROTEIN_TARGET_G: 120,
  DAILY_FAT_TARGET_G: 80,
  DAILY_CARBS_TARGET_G: 300,

  // Настройки воды
  DEFAULT_WATER_GLASSES: 10, // количество стаканов в день
  DEFAULT_GLASS_ML: 250, // миллилитров в одном стакане

  // Настройки истории
  MAX_RECENT_ITEMS: 50, // максимальное количество недавних продуктов
} as const;
