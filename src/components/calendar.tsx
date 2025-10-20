"use client";

import { useState, useEffect } from "react";
import { daysInWeek } from "@/config/weekDays";
import { daysInMonth } from "@/config/monthDays";
import { db } from "@/firebase/config";
import { useAuth } from "@/firebase/useAuth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

interface CalendarEvent {
  start: string;
  end: string;
}

const Calendar: React.FC<{ month: number; year: number }> = ({ month, year }) => {
  const { user } = useAuth();
  const totalDays = daysInMonth(String(month), String(year));
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [data, setData] = useState<Record<number, CalendarEvent>>({});

  // Load & listen for changes in user’s calendar data
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "calendar_events", user.uid);

    // Realtime sync with Firestore
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const firestoreData = snap.data() as { days?: Record<number, CalendarEvent> };
        setData(firestoreData.days || {});
      }
    });

    return unsubscribe;
  }, [user]);

  // Save updated day data to Firestore
  const handleSaveDay = async (day: number, start: string, end: string) => {
    if (!user) return;
    const ref = doc(db, "calendar_events", user.uid);
    const uid = user.uid;
    const updated = { ...data, [day]: { start, end } };
    setData(updated);

    try {
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        await updateDoc(ref, { days: updated });
      } else {
        await setDoc(ref, { days: updated });
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

  return (
    <>
      {/* Week Header */}
      <section className="grid grid-cols-7">
        {daysInWeek.map((week, i) => (
          <div key={i} className="w-full h-5 text-center relative font-semibold">
            {week}
          </div>
        ))}
      </section>

      {/* Calendar */}
      <section className="grid grid-cols-7 gap-2 p-4 w-full relative">
        {daysArray.map((day) => (
          <div
            key={day}
            onClick={() => dayClickHandler(day)}
            className={`relative border rounded-md transition-all duration-300 ease-in-out cursor-pointer flex flex-col justify-center items-center origin-center select-none ${
              selectedDay === day
                ? "opacity-0 pointer-events-none"
                : "hover:scale-105 hover:bg-cyan-900 bg-cyan-950 opacity-85 backdrop-blur-lg border-gray-500 w-full h-20"
            }`}
          >
            <span>Day: {day}</span>
            {data[day] && (
              <span className="text-cyan-400 text-xs">
                {data[day].start} - {data[day].end}
              </span>
            )}
          </div>
        ))}

        {/* Modal */}
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

// ✅ Modal Subcomponent
function Modal({
  day,
  isOpening,
  isClosing,
  onClose,
  onSave,
  existing,
}: {
  day: number;
  isOpening: boolean;
  isClosing: boolean;
  onClose: () => void;
  onSave: (day: number, start: string, end: string) => void;
  existing?: { start: string; end: string };
}) {
  const [start, setStart] = useState(existing?.start || "");
  const [end, setEnd] = useState(existing?.end || "");

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        transition-all duration-300 ease-in-out
        ${
          isClosing
            ? "opacity-0 scale-90"
            : isOpening
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90"
        }
        w-[60vw] h-[60vh] bg-black/60 backdrop-blur-3xl border border-cyan-800 
        rounded-2xl z-[2120] flex flex-col items-center justify-center 
        shadow-xl shadow-cyan-900/40`}
    >
      <span className="text-lg font-semibold text-cyan-300 mb-6">
        Day: {day}
      </span>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Start"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="bg-cyan-200 rounded-md w-28 px-1 text-black"
        />
        <input
          type="text"
          placeholder="End"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="bg-cyan-200 rounded-md w-28 px-1 text-black"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(day, start, end)}
            className="px-3 py-1 bg-cyan-700 text-white rounded-md hover:bg-cyan-600"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Calendar;