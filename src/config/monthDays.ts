export const daysInMonth = (month: string, year: string) => {
  return new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
}