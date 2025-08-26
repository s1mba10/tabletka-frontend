export const colorForDayPct = (pct: number): string => {
  if (pct === 100) return '#F59E0B';
  if (pct > 100) return '#EF4444';
  return '#22C55E';
};
