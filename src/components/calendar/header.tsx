import { daysInWeek } from "@/config/weekDays";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

export const CalendarHeader: React.FC = () => {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <section className="grid grid-cols-7">
      <button
        onClick={handleLogout}
        className="text-xs text-gray-400 mt-3 hover:text-red-400"
      >
        Log out
      </button>
      {daysInWeek.map((w, i) => (
        <div key={i} className="w-full h-5 text-center font-semibold">
          {w}
        </div>
      ))}
    </section>
  );
};
