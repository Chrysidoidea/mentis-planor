export const daysInMonth = (month: number | string, year: number | string): number => {
  const m = Number(month);
  const y = Number(year);
  return new Date(y, m + 1, 0).getDate();
};