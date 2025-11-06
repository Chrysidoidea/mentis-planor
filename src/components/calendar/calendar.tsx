"use client";

import React, { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  getDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import { CalendarHeader } from "@/components/calendar/header";
import { dayClickHandler, getColorClass } from "@/components/calendar/helpers";
import {
  dataAtom,
  isOpeningAtom,
  isClosingAtom,
  selectDayAtom,
} from "@/config/atoms/atoms";
import { useAtom } from "jotai";
import { animationTriggeredAtom } from "@/config/atoms/atoms";

const Calendar: React.FC<{ month: number; year: number }> = ({
  month,
  year,
}) => {
  const [data] = useAtom(dataAtom);
  const [isOpening, setIsOpening] = useAtom(isOpeningAtom);
  const [, setIsClosing] = useAtom(isClosingAtom);
  const [selectedDay, setSelectedDay] = useAtom(selectDayAtom);
  const [animationTriggered] = useAtom(animationTriggeredAtom);

  const { allDays, startIndex } = useMemo(() => {
    const firstDay = startOfMonth(new Date(year, month));
    const lastDay = endOfMonth(firstDay);
    const dayOfWeek = getDay(firstDay);
    const startIndex = (dayOfWeek + 6) % 7;
    const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });
    return { allDays, startIndex };
  }, [month, year]);

  const getTotalMinutes = (day: number) => {
    const sessions = data[day]?.sessions;
    if (!sessions) return 0;
    return sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  };

  const formatMinutesExact = (totalMinutes: number) => {
    if (totalMinutes == null) return "--";
    const totalSeconds = Math.round(totalMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");

    if (hours > 0) {
      return seconds === 0
        ? `${hours}:${mm} h total`
        : `${hours}:${mm}:${ss} h total`;
    } else {
      return seconds === 0 ? `${minutes} m` : `${minutes}:${ss} m`;
    }
  };

  return (
    <>
      <CalendarHeader />
      <section
        className={`grid grid-cols-7 gap-1 md:gap-2 p-1 md:p-4 w-full relative`}
      >
        {Array.from({ length: startIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="opacity-0 pointer-events-none" />
        ))}

        {allDays.map((date) => {
          const dayNum = Number(format(date, "d"));
          const totalMinutes = getTotalMinutes(dayNum);
          const exactLabel = formatMinutesExact(totalMinutes);
          const colorClass = getColorClass(totalMinutes);

          return (
            <div
              key={dayNum}
              onClick={() =>
                dayClickHandler(
                  dayNum,
                  selectedDay,
                  setIsClosing,
                  setSelectedDay,
                  setIsOpening
                )
              }
              className={`relative w-full h-20 border rounded-md transition-all duration-300 ease-in-out cursor-pointer flex flex-col justify-center items-center select-none hover:scale-105 ${colorClass} ${
                isOpening ? "pointer-events-none blur-md" : "pointer-events-auto blur-none"
              } ${animationTriggered ? "opacity-0 backdrop-blur-xs" : "opacity-100 backdrop-blur-lg "}`}
            >
              <span className="font-semibold">{dayNum}</span>
              {totalMinutes > 0 && (
                <span className="text-gray-300 text-xs">{exactLabel}</span>
              )}
              {data[dayNum]?.sessions && (
                <span className={`text-gray-400 text-[10px]`}>
                  {data[dayNum].sessions.length} entr
                  {data[dayNum].sessions.length === 1 ? "y" : "ies"}
                </span>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
};

export default Calendar;
