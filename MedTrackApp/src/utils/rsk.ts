export const colorForDayPct = (pctExact: number | null): string => {
  if (pctExact == null) {
    return '#A3A3A3';
  }
  if (pctExact <= 80) {
    return '#22C55E';
  }
  if (pctExact <= 110) {
    return '#FFC107';
  }
  return '#EF4444';
};
