import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { HandleSaveDayProps } from "./types/types";

export const getColorClass = (totalMinutes: number) => {
  const hours = totalMinutes / 60;
  if (hours >= 4)
    return "bg-green-600/20 border-green-500 shadow-green-800/40";
  if (hours >= 3)
    return "bg-lime-900/20 border-lime-500 shadow-lime-800/40";
  if (hours >= 1)
    return "bg-orange-900/20 border-orange-500 shadow-orange-800/40";
  if (hours > 0)
    return "bg-red-900/20 border-red-500 shadow-red-800/40";
  return "bg-gray-850/90 border-gray-500";
};

export const dayClickHandler = (
  day: number,
  selectedDay: number | null,
  setIsClosing: (b: boolean) => void,
  setSelectedDay: (n: number | null) => void,
  setIsOpening: (b: boolean) => void
) => {
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

export const handleSaveDay = async ({
  day,
  sessions,
  data,
  user,
  db,
  setData,
  setIsClosing,
  setSelectedDay,
  setIsOpening,
}: HandleSaveDayProps): Promise<void> => {
  if (!user) return;

  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  const ref = doc(db, "calendar_events", user.uid, `${year}_${month}`, "data");

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

export const calculateDuration = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (
    [sh, sm, eh, em].some((v) => isNaN(v)) ||
    start.trim() === "" ||
    end.trim() === ""
  ) {
    return { total: "", minutes: 0 };
  }
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
