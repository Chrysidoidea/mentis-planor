import { daysInWeek } from "@/config/weekDays";

const Calendar: React.FC = () => {

  return (
    <>
    {daysInWeek.map((week, index) => (
        <div key={index}>{week}</div>
    ))}
    </>
  )

};

export default Calendar;
