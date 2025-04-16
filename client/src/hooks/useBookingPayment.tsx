import { BookingData } from "@/services/bookings/booking-api";
import { useCreateBooking, useCreatePayment } from "@/services/bookings/booking-mutation";
import { AxiosError } from "axios";
import { toast } from "sonner";

export default function useBookingPayment() {
  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();
  const { mutate: createPayment, isPending: isCreatingPayment } = useCreatePayment();
  
  const handlePaymentNow = async (bookingData: BookingData, onBookingCreated: (bookingId: string) => void) => {
    let bookingId: string | undefined;
    createBooking(bookingData, {
      onSuccess: (bookingRes) => {
        if (bookingRes.success && bookingRes.result) {
          bookingId = bookingRes?.result?._id;
          createPayment({ bookingId }, {
            onSuccess: (paymentRes) => {
              if (paymentRes.success && bookingId) {
                toast.success(paymentRes.message);
                onBookingCreated(bookingId)
              } else {
                toast.error("Error when booking!");
              }
            },
            onError: () => {
              toast.error("Payment API failed!");
            }
          });
        } else {
          toast.error("Error when booking!");
        }
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.error)
        } else {
          toast.error("Booking failed!");
        }
      }
    });

    return bookingId;
  }

  return {
    isCreatingBooking,
    isCreatingPayment,
    handlePaymentNow,
  }
}