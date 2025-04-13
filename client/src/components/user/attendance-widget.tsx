import { CalendarHeart } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { useCheckin, useCheckinHistory } from "@/hooks/useAttendance";

const AttendanceWidget = () => {
  const { mutate: checkin, isPending } = useCheckin();
  const { data } = useCheckinHistory();

  // check in for current day
  const handleCheckIn = () => {
    checkin();
  }

  return (
    <div className="bg-white border border-border rounded-xl flex flex-col items-center pb-4">
      <Calendar
        className="mx-auto w-fit text-primary"
        disableNavigation={true}
        modifiers={{
          checked: data!
        }}
        modifiersClassNames={{
          checked: "bg-teal-100 text-primary !font-bold hover:bg-teal-200 hover:primary rounded-none"
        }}
      />
      <Button size={"sm"} onClick={handleCheckIn} disabled={isPending}>
        Check In
        <CalendarHeart />
      </Button>
    </div>
  )
}

export default AttendanceWidget;