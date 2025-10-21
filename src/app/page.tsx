"use client";

import Calendar from "@/components/calendar";
import CursorGlow from "@/effects/glowCursorEffect";
// import { dayCalculator } from "@/config/weekDays";
import { monthNames } from "@/config/monthHelper";
import { Authenticator } from "@/components/auth";
import { useAuth } from "@/firebase/useAuth";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const handlePrevMonth = () => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };



  return (
    <div className="min-h-lvh w-full bg-gradient-to-t z-40 from-black to-gray-800 p-1">
      <h1 className="text-center text-amber-400 z-50 p-2 font-bold text-4xl m-5">
        Mentis Planor
      </h1>

      <section className="text-amber-500 font-bold text-2xl grid grid-cols-3 place-content-center place-items-center">
        <button
          onClick={handlePrevMonth}
          className="text-white hover:text-amber-400 transition"
        >
          ← Prev
        </button>

        <span className="text-3xl">
          {monthNames[month]} {year}
        </span>

        <button
          onClick={handleNextMonth}
          className="text-white hover:text-amber-400 transition"
        >
          Next →
        </button>
      </section>

      <div className="grid content-center text-white z-20 rounded-xs text-center">
        <CursorGlow />
        {user ? (
          <Calendar month={month} year={year} />
        ) : (
          <Authenticator />
        )}
      </div>
    </div>
  );
}