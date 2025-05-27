import { getBusyDates } from "@/services/users/user-api";
import { useQuery } from "@tanstack/react-query";

export default function useGetBusyDates(tourGuideId: string, role: "TOUR_GUIDE" | "TRAVELER") {
  return useQuery({
    queryKey: ["busyDates", tourGuideId],
    queryFn: () => getBusyDates(tourGuideId as string),
    select: (busyDates) => {
      return {
        _id: busyDates._id,
        tourGuideId: busyDates.tourGuideId,
        dates: busyDates.dates.filter((d) => d.status === "UNAVAILABLE" || d.status === "BOOKED"),
      }
    },
    enabled: role === "TOUR_GUIDE",
    staleTime: 1000 * 60 * 60 * 24,
  });
}