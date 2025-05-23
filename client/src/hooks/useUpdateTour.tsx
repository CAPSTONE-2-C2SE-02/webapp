import { updateTour } from "@/services/tours/tour-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useUpdateTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => updateTour(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours", "tours-author"] });
      toast.success("Tour updated successfully");
    },
    onError: (error) => {
      console.error(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error || "Failed to update tour. Please try again.");
      }
    },
  })
}