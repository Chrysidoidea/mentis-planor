"use client";

import Calendar from "@/components/calendar";
import CursorGlow from "@/effects/glowCursorEffect";
import { dayCalculator } from "@/config/weekDays";

export default function Home() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-lvh w-full bg-gradient-to-t z-40 from-cyan-950 to-cyan-800 p-1 ">
      <h1 className="text-center text-amber-400 z-50 p-2 font-bold text-4xl m-5">
        Mentis Planor
      </h1>
      <section className="text-amber-500 font-bold text-2xl grid grid-cols-3 place-content-center place-items-center">
        <span>Year: {currentYear}</span>
        <span className="text-3xl">{dayCalculator()}</span>
        <span>Month: {currentMonth}</span>
      </section>

      <div className="grid content-center text-white z-20 rounded-xs text-center">
        <CursorGlow></CursorGlow>
        <Calendar month={currentMonth} year={currentYear} />{" "}
      </div>
    </div>
  );
}
