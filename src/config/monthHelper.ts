export const daysInMonth = (
  month: number | string,
  year: number | string
): number => {
  const m = Number(month);
  const y = Number(year);
  return new Date(y, m + 1, 0).getDate();
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
