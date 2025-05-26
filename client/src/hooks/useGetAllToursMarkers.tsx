import { fetchAllToursMarkers } from "@/services/tours/tour-api";
import { useQuery } from "@tanstack/react-query";

export const useGetAllToursMarkers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tours-markers"],
    queryFn: () => fetchAllToursMarkers(),
  });

  return {
    data,
    isLoading,
    error,
  };
};