"use client";
import { daysInWeek } from "@/config/weekDays";
import { daysInMonth } from "@/config/monthDays";
import { useState } from "react";

const Calendar: React.FC<{ month: number; year: number }> = ({
  month,
  year,
}) => {
  const totalDays = daysInMonth(String(month), String(year));
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [closigAnimation, setClosingAnimation] = useState<number | null>(null);

  // const dayClickHandler = (day: number) => {
  //   console.log(day);
  //   setSelectedDay((prev) => (prev === day ? null : day));
  // };

  const dayClickHandler = (day: number) => {
    if (selectedDay == day) {
      setClosingAnimation(day);
      setTimeout(() => {
        setSelectedDay(null);
        setClosingAnimation(null);
      }, 300);
    } else {
      setSelectedDay(day);
    }
  };

  return (
    <>
      <section className="grid grid-cols-7">
        {daysInWeek.map((week, index) => (
          <div key={index} className="w-full h-5 text-center relative">
            {week}
          </div>
        ))}
      </section>

      <section className="grid grid-cols-7 gap-2 p-4 w-full">
        {daysArray.map((day) => {
          const isSelected = selectedDay === day;
          const isClosing = closigAnimation === day;

          return (
            <div
              key={day}
              onClick={() => dayClickHandler(day)}
              className={`bg-amber-950 border rounded-md
        transition-all duration-200 ease-in-out cursor-pointer 
        flex flex-col justify-items-center
        ${
          isSelected
            ? isClosing
              ? "animate-fadeOut bg-black/50 backdrop-blur-3xl border-cyan-800 rounded-md w-10/12 h-10/12 absolute top-0 left-1/12 z-[2120]"
              : "animate-fadeIn bg-black/50 backdrop-blur-3xl border-cyan-800 rounded-md w-10/12 h-10/12 absolute top-0 left-1/12 z-[2120]"
            : "hover:scale-105 hover:bg-cyan-900 bg-cyan-950 opacity-80 backdrop-blur-lg rounded-md border-gray-500 w-full h-20"
        }`}
            >
              {"Day: " + day}
              {isSelected && !isClosing ? (
                <>
                  <span>SetTime</span>
                  <span>SW</span>
                </>
              ) : (
                <>
                  <span>TotalTime</span>
                </>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
};

export default Calendar;
