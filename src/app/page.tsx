"use client";

import Calendar from "@/components/calendar/calendar";
import { useEffect } from "react";
import CursorGlow from "@/effects/glowCursorEffect";
import { monthNames } from "@/config/monthHelper";
import { Authenticator } from "@/components/auth";
import { useAuth } from "@/firebase/useAuth";
import { useState } from "react";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { atom, useAtom } from "jotai";
import { CalendarEvent } from "@/components/calendar/types/types";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Modal } from "@/components/calendar/modal";
import { dayClickHandler, handleSaveDay } from "@/components/calendar/helpers";

export const selectDayAtom = atom<number | null>(null);
export const isClosingAtom = atom<boolean>(false);
export const isOpeningAtom = atom<boolean>(false);
export const dataAtom = atom<Record<number, CalendarEvent>>({});

export default function Home() {
  const [selectedDay, setSelectedDay] = useAtom(selectDayAtom);
  const [isClosing, setIsClosing] = useAtom(isClosingAtom);
  const [isOpening, setIsOpening] = useAtom(isOpeningAtom);
  const [data, setData] = useAtom(dataAtom);

  const { user } = useAuth();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

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
  }, [user, month, year, setData]);

  const handlePrevMonth = () => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  return (
    <>
      <h1 className="text-center z-50 p-2 m-5 text-4xl font-bold text-gray-300">
        Mentis Planor
      </h1>
      {user ? (
        <button
          onClick={handleLogout}
          className="fixed right-4 text-xs cursor-pointer text-gray-400 mt-0 md:mt-3 hover:text-red-400 self-end mr-4 transition-all duration-200 ease-in-out "
        >
          Log out
        </button>
      ) : null}
      {user && (
        <section className="pt-5 text-gray-500 font-bold text-2xl grid grid-cols-3 place-content-center place-items-center">
          <button
            onClick={handlePrevMonth}
            className="text-white hover:text-gray-400 transition text-2xl cursor-pointer"
          >
            ← Prev
          </button>

          <span className="text-2xl font-bold text-center text-gray-300 pb-8">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="text-white hover:text-gray-400 transition text-2xl cursor-pointer"
          >
            Next →
          </button>
        </section>
      )}
      <div className="grid content-center text-white z-20 rounded-xs text-center">
        <CursorGlow />
        {user ? <Calendar month={month} year={year} /> : <Authenticator />}
      </div>
      {selectedDay !== null && (
        <Modal
          day={selectedDay}
          isOpening={isOpening}
          isClosing={isClosing}
          onClose={() =>
            dayClickHandler(
              selectedDay,
              selectedDay,
              setIsClosing,
              setSelectedDay,
              setIsOpening
            )
          }
          onSave={(day, sessions) =>
            handleSaveDay({
              day,
              sessions,
              data,
              user,
              db,
              setData,
              setIsClosing,
              setSelectedDay,
              setIsOpening,
            })
          }
          existing={data[selectedDay]}
        />
      )}
    </>
  );
}
