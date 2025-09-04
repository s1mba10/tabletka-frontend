// Normalize units to app-wide conventions.

export function toStepsCount(n: number): number {
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

export function toBpm(n: number): number {
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 10) / 10; // 1 decimal
}

export function toKcal(n: number): number {
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 10) / 10;
}

export function toKg(n: number): number {
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 10) / 10;
}