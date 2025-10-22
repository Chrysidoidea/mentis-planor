  export const getColorClass = (totalMinutes: number) => {
    const hours = totalMinutes / 60;
    if (hours >= 4)
      return "bg-green-900/50 border-green-500 shadow-green-800/40  w-full h-20";
    if (hours >= 1)
      return "bg-orange-900/50 border-orange-500 shadow-orange-800/40  w-full h-20";
    if (hours > 0)
      return "bg-red-900/50 border-red-500 shadow-red-800/40  w-full h-20";
    return "bg-gray-850 opacity-85 border-gray-500 w-full h-20";
  };