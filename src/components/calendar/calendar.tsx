"use client";

import { useState, useEffect } from "react";
import { daysInWeek } from "@/config/weekDays";
import { daysInMonth } from "@/config/monthHelper";
import { db } from "@/firebase/config";
import { useAuth } from "@/firebase/useAuth";
import type { AuthUser } from "@/firebase/useAuth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import type { TimeBlock, CalendarEvent } from "./types/types";
import { Modal } from "./modal";


const Calendar: React.FC<{ month: number; year: number }> = ({
  month,
  year,
}) => {
  // Cast the hook return so TypeScript knows `user` is a Firebase User or null
  const { user } = useAuth() as { user: AuthUser | null };
  const totalDays = daysInMonth(String(month), String(year));
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [data, setData] = useState<Record<number, CalendarEvent>>({});

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

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const firestoreData = snap.data() as {
          days?: Record<number, CalendarEvent>;
        };
        setData(firestoreData.days || {});
      } else {
        setData({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, month, year]);

  // --- Save to Firestore ---
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

    // Animate close
    setIsClosing(true);
    setTimeout(() => {
      setSelectedDay(null);
      setIsClosing(false);
      setIsOpening(false);
    }, 300);
  };

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

  const getTotalMinutes = (day: number) => {
    const sessions = data[day]?.sessions;
    if (!sessions) return 0;
    return sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  };
  const getColorClass = (totalMinutes: number) => {
    const hours = totalMinutes / 60;
    if (hours >= 4)
      return "bg-green-900/50 border-green-500 shadow-green-800/40  w-full h-20";
    if (hours >= 1)
      return "bg-orange-900/50 border-orange-500 shadow-orange-800/40  w-full h-20";
    if (hours > 0)
      return "bg-red-900/50 border-red-500 shadow-red-800/40  w-full h-20";
    return "bg-cyan-950 opacity-85 border-gray-500 w-full h-20";
  };
  return (
    <>
      {/* Week Header */}
      <section className="grid grid-cols-7">
        {daysInWeek.map((w, i) => (
          <div key={i} className="w-full h-5 text-center font-semibold">
            {w}
          </div>
        ))}
      </section>

      {/* Calendar */}
      <section className="grid grid-cols-7 gap-2 p-4 w-full relative">
        {daysArray.map((day) => {
          const totalMinutes = getTotalMinutes(day);
          const totalHours = (totalMinutes / 60).toFixed(1);
          const colorClass = getColorClass(totalMinutes);

          return (
            <div
              key={day}
              onClick={() => dayClickHandler(day)}
              className={`relative border rounded-md transition-all duration-300 ease-in-out cursor-pointer flex flex-col justify-center items-center select-none backdrop-blur-lg hover:scale-105 ${colorClass}`}
            >
              <span className="font-semibold">Day {day}</span>
              {totalMinutes > 0 && (
                <span className="text-cyan-300 text-xs">
                  {totalHours} h total
                </span>
              )}
              {data[day]?.sessions && (
                <span className="text-cyan-400 text-[10px]">
                  {data[day].sessions.length} entr
                  {data[day].sessions.length === 1 ? "y" : "ies"}
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
