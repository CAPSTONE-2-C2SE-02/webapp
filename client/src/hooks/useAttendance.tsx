import { checkInDaily, getAttendanceDates } from "@/services/attendance-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkInDaily,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      toast.success(response.message || "Check In Successfully");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error);
      }
    }
  });
};

export function useCheckinHistory() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendanceDates,
    select: (data) => data?.result?.map(item => new Date(item.date)),
  });
}