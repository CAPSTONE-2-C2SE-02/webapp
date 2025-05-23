import { MapPin, Clock, Users, Loader2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/types";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Link } from "react-router";
import { getAbsoluteAddress } from "../utils/convert";
import useAuthInfo from "@/hooks/useAuth";
import { useGetPaymentBooking } from "@/services/bookings/booking-mutation";
import TourBookingBillDialog from "./tour-booking-bill-dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface TourBookingInfoCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  onPayment: (bookingId: string) => void;
  onComplete: (bookingId: string) => void;
  onReview: (bookingId: string) => void;
  onViewCancel: (Booking: string) => void;
  isPaymentPending?: boolean;
}

const TourBookingInfoCard = ({
  booking,
  onCancel,
  onPayment,
  onComplete,
  onReview,
  onViewCancel,
  isPaymentPending = false,
}: TourBookingInfoCardProps) => {
  const authInfo = useAuthInfo();
  const role = authInfo?.role;
  const queryClient = useQueryClient();
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);

  const { data: paymentURL, status } = useGetPaymentBooking(booking._id);

  const totalPeople = booking.adults + booking.youths + booking.children;
  const isPending =
    booking.paymentStatus === "PENDING" && booking.status === "PENDING";
  const isPaid =
    (booking.paymentStatus === "PAID" && booking.status === "PAID") ||
    booking.status === "WAITING_CONFIRM";
  const isCompleted =
    booking.status === "COMPLETED" && booking.paymentStatus === "PAID";
  const isCanceled =
    booking.status === "CANCELED" || booking.paymentStatus === "TIMEOUT";

  const handleNavigatePayment = () => {
    if (status === "success" && paymentURL?.result) {
      onPayment(paymentURL?.result?.paymentUrl);
    }
  };

  const confirmAgainCompleteTour = () => {
    queryClient.invalidateQueries({
      queryKey: [role === "TRAVELER" ? "travelerBookings" : "tourGuideBookings"],
    });
  }

  return (
    <>
    <div className="border rounded-lg overflow-hidden flex bg-white shadow-sm p-3 gap-4 relative">
      <div className="w-56 h-40 overflow-hidden rounded-md group">
        <img
          src={booking.tourId.imageUrls[0]}
          alt={booking.tourId.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div>
          <Link
            to={`/tours/${booking.tourId._id}`}
            className="hover:underline font-medium text-sm"
          >
            {booking.tourId.title}
          </Link>
          <p className="text-xs text-primary font-semibold mt-1">
            {format(new Date(booking.startDate), "dd/MM/yyyy")} -{" "}
            {format(new Date(booking.endDate), "dd/MM/yyyy")}
          </p>

          <div className="flex items-center mt-2">
            <MapPin className="h-4 w-4 text-teal-500" />
            <span className="text-xs text-teal-500 ml-1 font-medium">
              {getAbsoluteAddress(booking.tourId.destination, booking.tourId.departureLocation)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 font-medium">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 stroke-teal-500" />
              <span className="text-xs ml-1">
                {booking.tourId.duration} Days
              </span>
            </div>

            <div className="flex items-center">
              <Users className="h-4 w-4 text-gray-500  stroke-teal-500" />
              <span className="text-xs ml-1">{totalPeople}</span>
            </div>
          </div>
        </div>
        <div className="items-center px-2 bg-slate-100 rounded-full w-fit">
          <span className="text-xs font-medium">
            Total: {booking.totalAmount} VND
          </span>
        </div>
      </div>

      <div className="flex space-x-2 items-end">
        {isPending && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => onCancel(booking._id)}
            >
              Cancel
            </Button>
            {role === "TRAVELER" && (
              <Button
                size="sm"
                variant="default"
                className="text-xs h-8"
                onClick={handleNavigatePayment}
                disabled={isPaymentPending}
              >
                {isPaymentPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1" />
                    Loading...
                  </>
                ) : (
                  "Payment"
                )}
              </Button>
            )}
          </>
        )}

        {isPaid && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="text-primary text-xs h-8 absolute right-3 top-3"
              aria-label="Booking Detail"
              onClick={() => setIsBillDialogOpen(true)}
            >
              <CircleAlert />
            </Button>
            {role === "TOUR_GUIDE" && booking.status === "WAITING_CONFIRM" ? (
              <Button size="sm" variant="default" className="text-xs h-8" onClick={confirmAgainCompleteTour}>
                Waiting traveler confirm complete tour
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onCancel(booking._id)}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  className="text-xs h-8"
                  onClick={() => onComplete(booking._id)}
                >
                  Complete Tour
                </Button>
              </>
            )}
          </>
        )}

        {isCompleted && role === "TRAVELER" && (
          <>
            {!booking.isReview ? (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onReview(booking._id)}
              >
                Review
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs h-8"
                onClick={() => onReview(booking._id)}
              >
                Reviewed
              </Button>
            )}
          </>
        )}
        {isCanceled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  className="text-red-500 font-semibold"
                  onClick={() => onViewCancel(booking._id)}
                >
                  Canceled
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>click to view Cancel Reason</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
      <TourBookingBillDialog
        isOpen={isBillDialogOpen}
        onOpenChange={setIsBillDialogOpen}
        booking={booking}
      />
    </>
  );
};
export default TourBookingInfoCard;
