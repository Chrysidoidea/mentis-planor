export const daysInWeek: Array<string> = [
  "Mon",
  "Tues",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const dayCalculator = () => {
  const currentDay = new Date().getDay();

  switch (currentDay) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 7:
      return "Sunday";
  }
};
