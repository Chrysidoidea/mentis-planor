"use client";

import { useState, useEffect } from "react";
import { daysInWeek } from "@/config/weekDays";
import { daysInMonth } from "@/config/monthHelper";
import { db } from "@/firebase/config";
import { useAuth } from "@/firebase/useAuth";
import type { AuthUser } from "@/firebase/useAuth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

interface TimeBlock {
  start: string;
  end: string;
  total: string;
  minutes: number;
  description: string;
}
interface CalendarEvent {
  sessions: TimeBlock[];
}

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
  onSave: (day: number, sessions: TimeBlock[]) => void;
  existing?: CalendarEvent;
}) {
  const [sessions, setSessions] = useState<TimeBlock[]>(
    existing?.sessions || [
      { start: "", end: "", total: "", minutes: 0, description: "" },
    ]
  );

  const calculateDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if (isNaN(sh) || isNaN(eh)) return { total: "", minutes: 0 };

    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    let diff = endMin - startMin;
    if (diff < 0) diff += 24 * 60;

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return {
      total: `${hours}:${mins.toString().padStart(2, "0")} h`,
      minutes: diff,
    };
  };

  const updateSession = (
    index: number,
    field: keyof TimeBlock,
    value: string
  ) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };

    if (field === "start" || field === "end") {
      const { total, minutes } = calculateDuration(
        newSessions[index].start,
        newSessions[index].end
      );
      newSessions[index].total = total;
      newSessions[index].minutes = minutes;
    }

    setSessions(newSessions);
  };

  const addSession = () => {
    setSessions([
      ...sessions,
      { start: "", end: "", total: "", minutes: 0, description: "" },
    ]);
  };

  const removeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
  };

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
      ${
        isClosing
          ? "opacity-0 scale-90"
          : isOpening
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90"
      }
      w-[70vw] max-h-[80vh] overflow-y-auto bg-black/70 backdrop-blur-3xl border border-cyan-800 rounded-2xl z-[2120] flex flex-col items-center justify-start p-6 shadow-xl shadow-cyan-900/40`}
    >
      <span className="text-lg font-semibold text-cyan-300 mb-6">
        Day {day}
      </span>

      {sessions.map((s, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 bg-cyan-950/30 p-3 rounded-xl mb-4 w-full"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Start (HH:MM)"
              value={s.start}
              onChange={(e) => updateSession(i, "start", e.target.value)}
              className="bg-cyan-200 rounded-md w-24 px-1 text-black"
            />
            <input
              type="text"
              placeholder="End (HH:MM)"
              value={s.end}
              onChange={(e) => updateSession(i, "end", e.target.value)}
              className="bg-cyan-200 rounded-md w-24 px-1 text-black"
            />
            <span className="text-cyan-300 text-sm w-20 text-center">
              {s.total || "total"}
            </span>
            <button
              onClick={() => removeSession(i)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              delete
            </button>
          </div>
          <textarea
            placeholder="Description..."
            value={s.description}
            onChange={(e) => updateSession(i, "description", e.target.value)}
            className="bg-cyan-200 rounded-md px-2 py-1 text-black resize-none w-full h-16"
          />
        </div>
      ))}

      <div className="flex gap-3 mt-4">
        <button
          onClick={addSession}
          className="px-3 py-1 bg-cyan-800 text-white rounded-md hover:bg-cyan-700"
        >
          + Add Row
        </button>
        <button
          onClick={() => onSave(day, sessions)}
          className="px-3 py-1 bg-green-700 text-white rounded-md hover:bg-green-600"
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
  );
}

export default Calendar;
