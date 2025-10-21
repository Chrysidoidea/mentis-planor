import { daysInWeek } from "@/config/weekDays";

export const CalendarHeader: React.FC = () => {
  return (
    <section className="grid grid-cols-7">
      {daysInWeek.map((w, i) => (
        <div key={i} className="w-full h-5 text-center font-semibold">
          {w}
        </div>
      ))}
    </section>
  );
};
