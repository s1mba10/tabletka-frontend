export const formatNumber = (value: number, fractionDigits = 1): string =>
  value.toLocaleString('ru-RU', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export const formatPercent = (value: number): string => `${Math.round(value)}%`;

