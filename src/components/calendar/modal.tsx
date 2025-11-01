"use client";
import { useState } from "react";
import { TimeBlock, CalendarEvent } from "./types/types";

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

  const fullDate = new Date();
  fullDate.setDate(day);
  const weekdayName = fullDate.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div
      className={`max-h-64 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
      ${
        isClosing
          ? "opacity-0 scale-90"
          : isOpening
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90"
      }
      w-[70vw] max-h-[80vh] overflow-y-auto bg-neutral-600/20 backdrop-glass border border-gray-700 rounded-2xl  z-[2120] flex flex-col items-center justify-start p-6 shadow-xl shadow-gray-600/40`}
    >
      <span className="text-2xl md:text-4xl font-bold text-gray-300 mb-6">
        {weekdayName} {day}
      </span>

      {sessions.map((s, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 bg-gray-900/10 p-3 rounded-xl mb-4 w-full hover:bg-gray-700/5 transition-all duration-200 ease-in-out"
        >
          <div className="flex items-center gap-2 flex-col md:flex-row">
            <input
              type="text"
              placeholder="Start (HH:MM)"
              value={s.start}
              onChange={(e) => updateSession(i, "start", e.target.value)}
              className="placeholder:text-center rounded-md w-30 px-1 text-gray-200 appearance-none focus:outline-none focus:ring-0 border-none bg-transparent
              text-xs h-8 md:text-sm
              "
            />
            <input
              type="text"
              placeholder="End (HH:MM)"
              value={s.end}
              onChange={(e) => updateSession(i, "end", e.target.value)}
              className="placeholder:text-center rounded-md w-30 px-1 text-gray-200 appearance-none focus:outline-none focus:ring-0 border-none bg-transparent
              text-xs md:text-sm"
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

          <textarea
            placeholder="Description..."
            value={s.description}
            onChange={(e) => updateSession(i, "description", e.target.value)}
            className="resize-y bg-gray-900/10 rounded-md px-1 py-1 text-gray-200
            text-xs h-8 md:text-sm
            focus:outline-none focus:ring-0 border-none"
          />
        </div>
      ))}

      <div className="flex gap-3 mt-2 md:mt-4 text-xs md:text-2xl">
        <button
          onClick={addSession}
          className="px-2 py-2 md:px-4 bg-gray-500 text-xl text-white rounded-md cursor-pointer transition-all duration-180 ease-in-out hover:bg-gray-400"
        >
          + Add Row
        </button>
        <button
          onClick={() => onSave(day, sessions)}
          className="px-2 py-2 md:px-4 bg-green-700 text-white text-xl rounded-md cursor-pointer transition-all duration-180 ease-in-out hover:bg-green-600 "
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="px-2 py-2 md:px-4 bg-gray-700 text-xl text-white rounded-md cursor-pointer transition-all duration-180 ease-in-out hover:bg-gray-600 "
        >
          Close
        </button>
      </div>
    </div>
  );
};
