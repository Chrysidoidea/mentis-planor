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