
import CancelTourModal from "@/components/modals/cancel-tour-modal";
import ReviewTourModal from "@/components/modals/review-tour-modal";
import TourBookingInfoCard from "@/components/tour/tour-booking-info-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppSelector } from "@/hooks/redux";
import { Booking, Review } from "@/lib/types";
import { confirmCompleteTourByTourGuide, confirmCompleteTourByTraveler } from "@/services/bookings/booking-api";
import { useGetPaymentBooking } from "@/services/bookings/booking-mutation";
import { fetchReviewByBookingId } from "@/services/tours/review-api";
import { fetchTourGuideBookings, fetchTravelerBookings } from "@/services/users/user-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const HistoryBookingPage = () => {
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const userId = userInfo?._id;
  const role = userInfo?.role;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("waitingForPayment");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState<Review | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [isEditable, setIsEditable] = useState(true);
  const [paymentBookingId, setPaymentBookingId] = useState<string>("");

  const { data: paymentURL, isPending: isGetPaymentUrl } = useGetPaymentBooking(paymentBookingId);

  const { data: bookings, isLoading, error } = useQuery<Booking[], Error>({
    queryKey: [role === "TRAVELER" ? "travelerBookings" : "tourGuideBookings"],
    queryFn: () =>
      role === "TRAVELER" ? fetchTravelerBookings() : fetchTourGuideBookings(),
    enabled: !!userId && !!role,
  });

  const handleCancel = async (bookingId: string) => {
    const booking = bookings?.find((b) => b._id === bookingId);
    if (!booking) {
      toast.error("Booking not found.");
      return;
    }
    setCancelBooking(booking);
    setIsCancelModalOpen(true);
  };
  const handleViewCancel = (bookingId: string) => {
    const booking = bookings?.find((b) => b._id === bookingId);
    if (!booking) {
      toast.error("Booking not found.");
      return;
    }
    setCancelBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handlePayment = async (bookingId: string) => {
    const booking = bookings?.find((b) => b._id === bookingId);
    if (!booking) {
      toast.error("Booking not found.");
      return;
    }
    setPaymentBookingId(bookingId);
  };

  const handleComplete = async (bookingId: string) => {
    try {
      if (role === "TRAVELER") {
        await confirmCompleteTourByTraveler(bookingId);
      } else {
        await confirmCompleteTourByTourGuide(bookingId);
      }
  
      toast.success("Tour marked as completed");
  
      queryClient.invalidateQueries({
        queryKey: [role === "TRAVELER" ? "travelerBookings" : "tourGuideBookings"],
      });
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to complete tour";
      toast.error(msg);
      console.error("Confirm complete error:", error);
    }
  };

  const handleReview = async (bookingId: string) => {
    const booking = bookings?.find((b) => b._id === bookingId);
    if (!booking) {
      toast.error("Booking not found.");
      return;
    }

    setSelectedBooking(booking);
    console.log("Booking isReview:", booking.isReview);
    if (booking.isReview) {
      try {
        const review = await fetchReviewByBookingId(booking._id);
        console.log("Fetched Review:", review);
        setReviewData(review);
        setIsEditable(false);
      } catch (error) {
        console.error("Error fetching review:", error);
        setReviewData(null);
        setIsEditable(true);
        toast.error("Failed to load review. Please try again.");
      }
    } else {
      setReviewData(null);
      setIsEditable(true);
    }

    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    if (paymentURL?.success && paymentURL.result) {
      window.location.href = paymentURL.result.paymentUrl;
    } else if (paymentURL && !paymentURL.success) {
      toast.error("Not found payment URL. Please try again.");
    }
  }, [paymentURL]);

  if (isLoading) {
    return <div className="text-center py-10 bg-slate-300">
      Loading...
    </div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  }

  if (!userId) {
    return <div className="text-center py-10">Please login to view your booking history</div>;
  }

  // filter booking by tab
  const filteredBookings = bookings?.filter((booking) => {
    if (activeTab === "waitingForPayment") {
      return booking.paymentStatus === "PENDING" && booking.status === "PENDING";
    }
    if (activeTab === "waitingForTourCompletion") {
      return booking.paymentStatus === "PAID" && booking.status === "PAID" || booking.status === "WAITING_CONFIRM";
    }
    if (activeTab === "completed") {
      return booking.status === "COMPLETED" && booking.paymentStatus === "PAID";
    }
    if (activeTab === "canceled") {
      return booking.status === "CANCELED" || booking.paymentStatus === "TIMEOUT";
    }
    if (activeTab === "notCompleted"){
      return booking.status === "NOT_COMPLETED"
    }

    return true;
  });
  return (
    <div className="my-8 w-full flex flex-col items-start gap-3 bg-white rounded-xl pb-5 mb-5">
      <div className="pt-5 pl-5 font-semibold text-3xl">History Booking</div>
      <div className="flex w-full rounded-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-1 items-center">
          <TabsList className="flex bg-transparent p-2 justify-start border-b border-border rounded-none">
            <TabsTrigger
              value="waitingForPayment"
              className="rounded-b-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm"
            >
              Waiting for payment
            </TabsTrigger>
            <TabsTrigger
              value="waitingForTourCompletion"
              className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm"
            >
              Waiting for tour completion
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="canceled"
              className="rounded-b-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm"
            >
              Canceled
            </TabsTrigger>
            <TabsTrigger
              value="notCompleted"
              className="rounded-b-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-medium text-sm"
            >
              Not Completed
            </TabsTrigger>
          </TabsList>

          {["waitingForPayment", "waitingForTourCompletion", "completed", "canceled", "notCompleted"].map((tab) => (
            <TabsContent key={tab} value={tab} className="px-4 space-y-4">
              {filteredBookings && filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <TourBookingInfoCard
                    key={booking._id}
                    booking={booking}
                    onCancel={handleCancel}
                    onPayment={handlePayment}
                    onComplete={handleComplete}
                    onReview={handleReview}
                    onViewCancel={handleViewCancel}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No bookings found for this status.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {selectedBooking && (
        <ReviewTourModal
          booking={selectedBooking}
          open={isReviewModalOpen}
          onOpenChange={(open) => {
            setIsReviewModalOpen(open);
            if (!open) setSelectedBooking(null);
          }}
          reviewData={reviewData}
          isEditable={isEditable}
        />
      )}
      {cancelBooking && (
        <CancelTourModal
          booking={cancelBooking}
          open={isCancelModalOpen}
          onOpenChange={(open) => {
            setIsCancelModalOpen(open);
            if (!open && cancelBooking.status !== "CANCELED") {
              setActiveTab("canceled"); 
            }
            if (!open) setCancelBooking(null);
          }}
          isEditable={cancelBooking.status === "PENDING" || cancelBooking.status === "PAID"}
        />
      )}
    </div>
  )
}

export default HistoryBookingPage
