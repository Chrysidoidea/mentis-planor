"use client";

import { useState, useEffect } from "react";
import { daysInMonth } from "@/config/monthHelper";
import { db } from "@/firebase/config";
import { useAuth } from "@/firebase/useAuth";
import type { AuthUser } from "@/firebase/useAuth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import type { TimeBlock, CalendarEvent } from "./types/types";
import { Modal } from "./modal";
import { getColorClass } from "./helpers";
import { CalendarHeader } from "./header";

const Calendar: React.FC<{ month: number; year: number }> = ({
  month,
  year,
}) => {
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

  return (
    <>
      <CalendarHeader />
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
              <span className="font-semibold">{day}</span>
              {totalMinutes > 0 && (
                <>
                  <span className="text-cyan-300 text-xs">
                    {totalHours} h total
                  </span>
                  <span className="text-cyan-300 text-xs">{totalMinutes} m total</span>
                </>
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
