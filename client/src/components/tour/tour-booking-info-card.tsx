import { MapPin, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Booking } from "@/lib/types"
import { format } from "date-fns";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useAppSelector } from "@/hooks/redux";
import ReviewTourModal from "../modals/review-tour-modal";

export interface TourBookingInfoCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  onPayment: (bookingId: string) => void;
  onComplete: (bookingId: string) => void;
  onReview: (bookingId: string) => void;
}

const TourBookingInfoCard = ({
  booking,
  onCancel,
  onPayment,
  onComplete,
  onReview,
}: TourBookingInfoCardProps) => {
  const totalPeople = booking.adults + booking.youths + booking.children;
  const isPending = booking.paymentStatus === "PENDING";
  const isPaid = booking.paymentStatus === "PAID" && booking.status === "PAID";
  const isCompleted = booking.status === "COMPLETED";
  const isCanceled = booking.status === "CANCELED";
  const [isShowCancelReasonOpen, setIsShowCancelReasonOpen] = useState(false);
  const [reviewTourOpen, setReviewTourOpen] = useState(false)
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const role = userInfo?.role; 
  
  return (
    <div className="border rounded-lg overflow-hidden flex bg-white shadow-sm">
      <div className="w-56 p-2 ">
        <img
          src={booking.tourId.imageUrls[0]}
          alt={booking.tourId.title}
          className="h-full rounded-md"
        />
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between gap-3">
        <div>
          <h2 className="font-medium text-sm">{booking.tourId.title}</h2>
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(booking.startDate), "dd/MM/yyyy")} -{" "}
            {format(new Date(booking.endDate), "dd/MM/yyyy")}
          </p>

          <div className="flex items-center mt-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-emerald-500 ml-1">{booking.tourId.departureLocation} - {booking.tourId.destination}</span>
          </div>
        </div>

        <div className="flex items-center justify-between ">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 stroke-emerald-500" />
              <span className="text-xs ml-1">{booking.tourId.duration} Days</span>
            </div>

            <div className="flex items-center">
              <Users className="h-4 w-4 text-gray-500  stroke-emerald-500" />
              <span className="text-xs ml-1">{totalPeople}</span>
            </div>
          </div>
        </div>
        <div className="items-center px-2 py- bg-slate-100 rounded-full w-fit">
                <span className="text-xs font-medium">Total: {booking.totalAmount}$</span>
          </div>
      </div>

      {/* <div className="w-32 p-4 flex flex-col justify-between items-end"> */}
        <div className="flex space-x-2 items-end m-2">
          {isPending &&(
            <>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onCancel(booking._id)}>
                Cancel
              </Button>
              {role === "TRAVELER" && (
                <Button size="sm" variant="default" className="text-xs h-8" onClick={() => onPayment(booking._id)}>
                  Payment
                </Button>
              )}
            </>
          )}

          {isPaid && (
            <>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onCancel(booking._id)}>
                Cancel
              </Button>
              <Button size="sm" variant="default" className="text-xs h-8" onClick={() => onComplete(booking._id)}>
                Complete Tour
              </Button>
            </>
          )}

          {isCompleted && (
            <>
            {role === "TRAVELER" && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onReview(booking._id)}>
              Review
            </Button>
            )}
            </>
          )}
          <ReviewTourModal
            booking={booking}
            open={reviewTourOpen}
            onOpenChange={setReviewTourOpen}
          />
          {isCanceled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline" className="text-red-500 font-semibold" onClick={() => setIsShowCancelReasonOpen(true)}>
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
    // </div>
  )
}
export default TourBookingInfoCard