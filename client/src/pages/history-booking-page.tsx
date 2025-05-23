import CancelTourModal from "@/components/modals/cancel-tour-modal";
import ReviewTourModal from "@/components/modals/review-tour-modal";
import TourBookingInfoCard from "@/components/tour/tour-booking-info-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MetaData from "@/components/utils/meta-data";
import useAuthInfo from "@/hooks/useAuth";
import { Booking, Review } from "@/lib/types";
import { confirmCompleteTourByTourGuide, confirmCompleteTourByTraveler } from "@/services/bookings/booking-api";
import { fetchReviewByBookingId } from "@/services/tours/review-api";
import { fetchTourGuideBookings, fetchTravelerBookings } from "@/services/users/user-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";

const HistoryBookingPage = () => {
  const authInfo = useAuthInfo();
  const userId = authInfo?._id;
  const role = authInfo?.role;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("waitingForPayment");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState<Review | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [isEditable, setIsEditable] = useState(true);

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

  const handlePayment = async (paymentURL: string) => {
    if (paymentURL) {
      window.location.href = paymentURL;
    } else {
      toast.error("Not found payment URL. Please try again.");
    }
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
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.error || "Failed to complete tour");
      }
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
    if (booking.isReview) {
      try {
        const review = await fetchReviewByBookingId(booking._id);
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
    <div className="my-4 p-3 w-full flex flex-col items-start gap-0 bg-white rounded-xl border">
      <MetaData title="Booking History" />
      <div className="pb-3 w-full">
        <div className="bg-teal-50 text-primary py-2 px-5 mr-1 rounded-lg border text-center border-primary shadow-[4px_4px_oklch(0.392_0.0844_240.76)] font-bold text-2xl">
          Booking History
        </div>
      </div>
      <div className="flex w-full rounded-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full items-center">
          <TabsList className="grid grid-cols-5 bg-primary/10 text-black">
            <TabsTrigger value="waitingForPayment" className="data-[state=active]:text-primary">
              Pending Payment
            </TabsTrigger>
            <TabsTrigger value="waitingForTourCompletion" className="data-[state=active]:text-primary">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
            </TabsTrigger>
            <TabsTrigger value="canceled">
              Canceled
            </TabsTrigger>
            <TabsTrigger value="notCompleted">
              Incomplete
            </TabsTrigger>
          </TabsList>

          {["waitingForPayment", "waitingForTourCompletion", "completed", "canceled", "notCompleted"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
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
