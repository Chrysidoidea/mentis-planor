import type { AuthUser } from "@/firebase/useAuth";
import type { Firestore } from "firebase/firestore";
export interface TimeBlock {
  start: string;
  end: string;
  total: string;
  minutes: number;
  description: string;
}
export interface CalendarEvent {
  sessions: TimeBlock[];
}
export interface HandleSaveDayProps {
  day: number;
  sessions: TimeBlock[];
  data: Record<number, CalendarEvent>;
  user: AuthUser;
  db: Firestore;
  setData: (data: Record<number, CalendarEvent>) => void;
  setIsClosing: (b: boolean) => void;
  setSelectedDay: (n: number | null) => void;
  setIsOpening: (b: boolean) => void;
  year: number;
  month: number;
}
