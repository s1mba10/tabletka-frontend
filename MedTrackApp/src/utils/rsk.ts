export const colorForDayPct = (pctExact: number | null): string => {
  if (pctExact == null) return '#A3A3A3';
  if (Math.round(pctExact) === 100) return '#F59E0B';
  return pctExact <= 100 ? '#22C55E' : '#EF4444';
};
