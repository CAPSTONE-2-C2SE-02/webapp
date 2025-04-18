import { fetchTourByUsername } from "@/services/tours/tour-api";
import { useQuery } from "@tanstack/react-query";


export default function useGetTourByUsername (username: string)  {
    return useQuery({
        queryKey: ["tours", username],
        queryFn: () => fetchTourByUsername(username),
      });

}