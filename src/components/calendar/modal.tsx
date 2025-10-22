"use client";
import { useState } from "react";
import { TimeBlock, CalendarEvent } from "./types/types";

// === Modal component for adding or editing time sessions for a given day ===
export const Modal = ({
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
}) => {
  // === initialize sessions: use existing data if available, otherwise create one empty block ===
  const [sessions, setSessions] = useState<TimeBlock[]>(
    existing?.sessions || [
      { start: "", end: "", total: "", minutes: 0, description: "" },
    ]
  );

  // === helper: calculate duration between start and end time ===
  const calculateDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if (isNaN(sh) || isNaN(eh)) return { total: "", minutes: 0 };

    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    let diff = endMin - startMin;

    // handle overnight sessions (e.g., 23:00 → 01:00)
    if (diff < 0) diff += 24 * 60;

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return {
      total: `${hours}:${mins.toString().padStart(2, "0")} h`,
      minutes: diff,
    };
  };

  // === update session field (start, end, total, description, etc.) ===
  const updateSession = (
    index: number,
    field: keyof TimeBlock,
    value: string
  ) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };

    // auto-recalculate duration if start or end changed
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

  // === add empty session row ===
  const addSession = () => {
    setSessions([
      ...sessions,
      { start: "", end: "", total: "", minutes: 0, description: "" },
    ]);
  };

  // === remove session by index ===
  const removeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
  };

  // === derive full date and weekday name from current month + day ===
  const fullDate = new Date();
  fullDate.setDate(day);
  const weekdayName = fullDate.toLocaleDateString("en-US", { weekday: "long" });

  return (
    // === modal wrapper with animation states (open / close) ===
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
      ${
        isClosing
          ? "opacity-0 scale-90"
          : isOpening
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90"
      }
      w-[70vw] max-h-[80vh] overflow-y-auto bg-neutral-600/20 backdrop-blur-3xl border border-gray-700 rounded-2xl z-[2120] flex flex-col items-center justify-start p-6 shadow-xl shadow-gray-700/40`}
    >
      {/* === header (shows selected day) === */}
      <span
        className="text-4xl font-bold text-pink-300 
  [text-shadow:0_0_1px_#ff00ff,0_0_2px_#ff00ff,0_0_1px_#ff00ff,0_0_4px_#ff00ff]"
      >
        {weekdayName} {day}
      </span>

      {/* === list of session blocks === */}
      {sessions.map((s, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 bg-gray-900/10 p-3 rounded-xl mb-4 w-full hover:bg-gray-700/5 transition-all duration-200 ease-in-out"
        >
          {/* === time inputs + delete button === */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Start (HH:MM)"
              value={s.start}
              onChange={(e) => updateSession(i, "start", e.target.value)}
              className="rounded-md w-30 px-1 text-gray-200 appearance-none focus:outline-none focus:ring-0 border-none bg-transparent"
            />
            <input
              type="text"
              placeholder="End (HH:MM)"
              value={s.end}
              onChange={(e) => updateSession(i, "end", e.target.value)}
              className="rounded-md w-30 px-1 text-gray-200appearance-none focus:outline-none focus:ring-0 border-none bg-transparent"
            />
            <span className="text-gray-200 text-sm w-20 text-center">
              {s.total || "total"}
            </span>
            <button
              onClick={() => removeSession(i)}
              className="ml-2 text-red-400 transition-all duration-180 ease-in-out cursor-pointer hover:text-red-600 text-sm"
            >
              delete
            </button>
          </div>

          {/* === description text area === */}
          <textarea
            placeholder="Description..."
            value={s.description}
            onChange={(e) => updateSession(i, "description", e.target.value)}
            className="bg-gray-900/10 rounded-md px-2 py-1 text-pink-200 resize-none w-full h-8 focus:outline-none focus:ring-0 border-none"
          />
        </div>
      ))}

      {/* === footer controls (add, save, close) === */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={addSession}
          className="px-3 py-1 bg-gray-500 text-white rounded-md cursor-pointer transition-all duration-180 ease-in-out hover:bg-gray-400"
        >
          + Add Row
        </button>
        <button
          onClick={() => onSave(day, sessions)}
          className="px-3 py-1 bg-green-700 text-white rounded-md cursor-pointer transition-all duration-180 ease-in-out hover:bg-green-600 "
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-700 text-white rounded-md cursor-pointer transition-all duration-180 ease-in-out hover:bg-gray-600 "
        >
          Close
        </button>
      </div>
    </div>
  );
};
