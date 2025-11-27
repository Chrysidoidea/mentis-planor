"use client";

import { useEffect, useState } from "react";
import { monthNames } from "@/config/monthHelper";
import { Authenticator } from "@/components/auth";
import { useAuth } from "@/firebase/useAuth";
import { auth, db } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { useAtom } from "jotai";
import backgroundImage from "../../public/background.png";
import { CalendarEvent } from "@/components/calendar/types/types";
import { doc, onSnapshot } from "firebase/firestore";
import { dayClickHandler, handleSaveDay } from "@/components/calendar/helpers";
import {
  dataAtom,
  isOpeningAtom,
  isClosingAtom,
  selectDayAtom,
  animationTriggeredAtom,
} from "@/config/atoms/atoms";
import Calendar from "@/components/calendar/calendar";
import CursorGlow from "@/effects/glowCursorEffect";
import Modal from "@/components/calendar/modal";
import Spinner from "@/components/loader";
import Image from "next/image";

export default function Home() {
  const [selectedDay, setSelectedDay] = useAtom(selectDayAtom);
  const [isClosing, setIsClosing] = useAtom(isClosingAtom);
  const [isOpening, setIsOpening] = useAtom(isOpeningAtom);
  const [data, setData] = useAtom(dataAtom);
  const [, setAnimationTriggered] = useAtom(animationTriggeredAtom);

  const { user, loading } = useAuth();

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

  const handleMonthSwitch = (direction: "prev" | "next"): void => {
    setAnimationTriggered(true);

    setTimeout(() => {
      setAnimationTriggered(false);
      setMonth((prev) => {
        if (direction === "prev") {
          return prev === 0 ? (setYear((y) => y - 1), 11) : prev - 1;
        }
        if (direction === "next") {
          return prev === 11 ? (setYear((y) => y + 1), 0) : prev + 1;
        }
        return prev;
      });
    }, 400);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  return (
    <>
      <Image
        src={backgroundImage}
        alt="background"
        fill
        className="object-cover object-center fixed -z-10 opacity-90"
        placeholder="blur"
      />
      <h1 className="text-center z-50 p-2 m-5 text-4xl font-bold text-gray-300 ">
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
        <section className="pt-5 grid grid-cols-3 place-content-center place-items-center">
          <button
            onClick={() => handleMonthSwitch("prev")}
            className="hover:scale-110 transition-all duration-200 ease-in-out  cursor-pointer"
          >
            <Image src="/backSvg.svg" alt="record" height={45} width={45} />
          </button>

          <span className="text-2xl font-bold text-center text-gray-300 pb-8">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={() => handleMonthSwitch("next")}
            className="hover:scale-110 transition-all duration-200 ease-in-out  cursor-pointer"
          >
            {" "}
            <Image src="/nextSvg.svg" alt="record" height={45} width={45} />
          </button>
        </section>
      )}
      <div className="grid content-center text-white z-20 rounded-xs text-center">
        <CursorGlow />
      {loading ? (
          <Spinner />
        ) : user ? (
          <Calendar month={month} year={year} />
        ) : (
          <Authenticator />
        )}
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
