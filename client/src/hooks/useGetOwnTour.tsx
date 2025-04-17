import { fetchAllPostTourGuide } from "@/services/tours/tour-api";
import { useQuery } from "@tanstack/react-query";

export default function useGetOwnTour() {
  return useQuery({
    queryKey: ["tours", "tours-author"],
    queryFn: fetchAllPostTourGuide,
  });
}
