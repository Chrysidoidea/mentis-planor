"use client";

import Calendar from "@/components/calendar/calendar";
import CursorGlow from "@/effects/glowCursorEffect";
import { monthNames } from "@/config/monthHelper";
import { Authenticator } from "@/components/auth";
import { useAuth } from "@/firebase/useAuth";
import { useState } from "react";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";

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

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className=" flex flex-col in-h-lvh w-full bg-transparent p-1">
      <h1
        className="text-center z-50 p-2 m-5 text-4xl font-bold text-gray-300"
      >
        Mentis Planor
      </h1>
      {user ? (
        <button
          onClick={handleLogout}
          className="text-xs cursor-pointer text-gray-400 mt-3 hover:text-red-400 self-end mr-4 transition-all duration-200 ease-in-out "
        >
          Log out
        </button>
      ) : null}
      {user && (
        <section className="text-gray-500 font-bold text-2xl grid grid-cols-3 place-content-center place-items-center">
          <button
            onClick={handlePrevMonth}
            className="text-white hover:text-gray-400 transition text-2xl cursor-pointer"
          >
            ← Prev
          </button>

          <span
            className="text-2xl font-bold text-gray-300"
          >
            {monthNames[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="text-white hover:text-gray-400 transition text-2xl cursor-pointer"
          >
            Next →
          </button>
        </section>
      )}
      <div className="grid content-center text-white z-20 rounded-xs text-center">
        <CursorGlow />
        {user ? <Calendar month={month} year={year} /> : <Authenticator />}
      </div>
    </div>
  );
}
