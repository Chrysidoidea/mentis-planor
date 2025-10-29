"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { useAuth } from "@/firebase/useAuth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import {
  startOfMonth,
  endOfMonth,
  getDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import type { AuthUser } from "@/firebase/useAuth";
import type { TimeBlock, CalendarEvent } from "./types/types";
import { Modal } from "./modal";
import { getColorClass } from "./helpers";
import { CalendarHeader } from "./header";

const Calendar: React.FC<{ month: number; year: number }> = ({
  month,
  year,
}) => {
  const { user } = useAuth() as { user: AuthUser | null };
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [data, setData] = useState<Record<number, CalendarEvent>>({});

  // === compute first day offset (Monday-based) ===
  const firstDay = startOfMonth(new Date(year, month));
  const dayOfWeek = getDay(firstDay);
  const startIndex = (dayOfWeek + 6) % 7;

  // === make day list ===
  const lastDay = endOfMonth(firstDay);
  const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });

  // === load data ===
  useEffect(() => {
    if (!user) return;
    setData({});

    const ref = doc(
      db,
      "calendar_events",
      user.uid,
      `${year}_${month}`,
      "data"
    );
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const firestoreData = snap.data() as {
          days?: Record<number, CalendarEvent>;
        };
        setData(firestoreData.days || {});
      } else {
        setData({});
      }
    });

    return () => unsub();
  }, [user, month, year]);

  // === save day ===
  const handleSaveDay = async (day: number, sessions: TimeBlock[]) => {
    if (!user) return;

    const ref = doc(
      db,
      "calendar_events",
      user.uid,
      `${year}_${month}`,
      "data"
    );
    const updated = { ...data, [day]: { sessions } };
    setData(updated);

    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { days: updated, updatedAt: new Date() });
      } else {
        await setDoc(ref, { days: updated, updatedAt: new Date() });
      }
    } catch (err) {
      console.error("Error saving calendar data:", err);
    }

    setIsClosing(true);
    setTimeout(() => {
      setSelectedDay(null);
      setIsClosing(false);
      setIsOpening(false);
    }, 300);
  };

  // === click handler ===
  const dayClickHandler = (day: number) => {
    if (selectedDay === day) {
      setIsClosing(true);
      setTimeout(() => {
        setSelectedDay(null);
        setIsClosing(false);
        setIsOpening(false);
      }, 300);
    } else {
      setSelectedDay(day);
      setTimeout(() => setIsOpening(true), 20);
    }
  };

  // === helpers ===
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

  // === render ===
  return (
    <>
      <CalendarHeader />
      <section className="grid grid-cols-7 gap-1 md:gap-2 p-1 md:p-4 w-full relative">
        {/* Empty cells before first day */}
        {Array.from({ length: startIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="opacity-0 pointer-events-none" />
        ))}

        {/* Days */}
        {allDays.map((date) => {
          const dayNum = Number(format(date, "d"));
          const totalMinutes = getTotalMinutes(dayNum);
          const exactLabel = formatMinutesExact(totalMinutes);
          const colorClass = getColorClass(totalMinutes);

          return (
            <div
              key={dayNum}
              onClick={() => dayClickHandler(dayNum)}
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

        {selectedDay && (
          <Modal
            day={selectedDay}
            isOpening={isOpening}
            isClosing={isClosing}
            onClose={() => dayClickHandler(selectedDay)}
            onSave={handleSaveDay}
            existing={data[selectedDay]}
          />
        )}
      </section>
    </>
  );
};

export default Calendar;
