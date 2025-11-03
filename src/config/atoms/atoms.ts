"use client";

import { atom } from "jotai";
import { CalendarEvent } from "@/components/calendar/types/types";

export const selectDayAtom = atom<number | null>(null);
export const isClosingAtom = atom<boolean>(false);
export const isOpeningAtom = atom<boolean>(false);
export const dataAtom = atom<Record<number, CalendarEvent>>({});
export const animationTriggeredAtom = atom<boolean>(false);
