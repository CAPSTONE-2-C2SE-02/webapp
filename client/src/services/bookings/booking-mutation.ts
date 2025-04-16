import { useMutation, useQuery } from "@tanstack/react-query"
import { createBooking, createPayment, getPayment, vnpReturn } from "./booking-api"

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: createBooking,
  });
};

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: createPayment,
  });
};

export const useGetPaymentBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ["payment", bookingId],
    queryFn: () => getPayment(bookingId),
    enabled: !!bookingId,
  });
};

export const useVnpReturn = () => {
  return useMutation({
    mutationFn: (params: Record<string, string>) => vnpReturn(params),
    onSuccess: (data) => {
      console.log('VNPay return processed successfully:', data);
    },
    onError: (error) => {
      console.error('Error processing VNPay return:', error);
    },
  });
};