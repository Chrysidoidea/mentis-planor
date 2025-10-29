import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { HandleSaveDayProps } from "./types/types";

export const getColorClass = (totalMinutes: number) => {
  const hours = totalMinutes / 60;
  if (hours >= 4)
    return "bg-green-900/50 border-green-500 shadow-green-800/40 w-full h-20";
  if (hours >= 1)
    return "bg-orange-900/50 border-orange-500 shadow-orange-800/40 w-full h-20";
  if (hours > 0)
    return "bg-red-900/50 border-red-500 shadow-red-800/40 w-full h-20";
  return "bg-gray-850 opacity-85 border-gray-500 w-full h-20";
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

  // Update local state first for immediate UI feedback
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