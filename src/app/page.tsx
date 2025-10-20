"use client";

import Calendar from "@/components/calendar";
import CursorGlow from "@/effects/glowCursorEffect";

export default function Home() {
  // const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentDay = new Date().getDay();
  const currentDate = new Date().getDate()

  // console.log(daysInMonth(currentMonth, currentYear));
  return (
    <div className="min-h-lvh w-full bg-gradient-to-t z-40 from-cyan-950 to-cyan-800 p-1 ">
      <h1 className="text-center text-amber-400 z-50 p-2 font-bold text-3xl ">
        Mentis Planor
      </h1>
      <span className="text-amber-500 text-center font-bold pl-3">
        Year: {currentYear}
      </span>
      <span className="text-amber-500 text-center font-bold">
        Month: {currentMonth}
      </span>
      <span>Day: {currentDate}</span>
      <div className="grid content-center text-white z-20 rounded-xs text-center">
        <CursorGlow></CursorGlow>
        <Calendar month={currentMonth} year={currentYear} />{" "}
      </div>
    </div>
  );
}
