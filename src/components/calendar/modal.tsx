'use client";'
import { useState } from "react";
import { TimeBlock, CalendarEvent } from "./types/types";


export const  Modal = ({
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