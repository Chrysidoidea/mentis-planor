import CursorGlow from "@/effects/glowCursorEffect";
import Calendar from "@/components/calendar";

export default function Home() {
  return (
    <div className="h-dvh w-full bg-gradient-to-t z-10 from-cyan-950 to-cyan-800  p-10">
      <h1 className="text-center text-amber-400 z-20 p-2 font-bold text-3xl">Mentis Planor</h1>
      <div className="grid grid-cols-7 text-pink-900 bg-amber-400 z-20">
        <Calendar />
      </div>
      <CursorGlow />
    </div>
  );
}
