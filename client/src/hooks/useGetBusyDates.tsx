import { getBusyDates } from "@/services/user-api";
import { useQuery } from "@tanstack/react-query";

export default function useGetBusyDates(tourGuideId: string) {
  return useQuery({
    queryKey: ["busyDates", tourGuideId],
    queryFn: () => getBusyDates(tourGuideId as string),
    select: (busyDates) => {
      return {
        _id: busyDates._id,
        tourGuideId: busyDates.tourGuideId,
        dates: busyDates.dates.filter((d) => d.status === "UNAVAILABLE"),
      }
    },
    enabled: !!tourGuideId,
  });
}