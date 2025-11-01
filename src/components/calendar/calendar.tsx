"use client";


import {
  startOfMonth,
  endOfMonth,
  getDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import { getColorClass } from "./helpers";
import { CalendarHeader } from "./header";
import { dayClickHandler } from "./helpers";
import {
  dataAtom,
  isOpeningAtom,
  isClosingAtom,
  selectDayAtom,
} from "@/app/page";
import { useAtom } from "jotai";
  import { animationTriggeredAtom } from "@/app/page";

const Calendar: React.FC<{ month: number; year: number }> = ({
  month,
  year,
}) => {
  const [data] = useAtom(dataAtom);
  const [, setIsOpening] = useAtom(isOpeningAtom);
  const [, setIsClosing] = useAtom(isClosingAtom);
  const [selectedDay, setSelectedDay] = useAtom(selectDayAtom);
  const [animationTriggered] = useAtom(animationTriggeredAtom)


  const firstDay = startOfMonth(new Date(year, month));
  const lastDay = endOfMonth(firstDay);
  const dayOfWeek = getDay(firstDay);
  const startIndex = (dayOfWeek + 6) % 7;

  const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });
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
      <section className={`grid grid-cols-7 gap-1 md:gap-2 p-1 md:p-4 w-full relative ${animationTriggered ? "opacity-0" : "opacity-100"} transition-all duration-100 ease-in-out`}>
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
              className={`relative border rounded-md transition-all duration-300 ease-in-out cursor-pointer flex flex-col justify-center items-center select-none backdrop-blur-lg hover:scale-105 ${colorClass}`}
            >
              <span className="font-semibold">{dayNum}</span>
              {totalMinutes > 0 && (
                <>
                  <span className="text-gray-300 text-xs">{exactLabel}</span>
                  <span className="text-gray-300 text-xs"></span>
                </>
              )}
              {data[dayNum]?.sessions && (
                <span className="text-gray-400 text-[10px]">
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
