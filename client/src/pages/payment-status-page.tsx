import TourBookingFailed from "@/components/tour/tour-booking-falied";
import TourBookingSuccess from "@/components/tour/tour-booking-success";
import { useVnpReturn } from "@/services/bookings/booking-mutation";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate: processVnpReturn } = useVnpReturn();
  const [paymentStatus, setPaymentStatus] = useState<boolean>(false);
  
  useEffect(() => {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    if (vnp_ResponseCode) {
      const queryParams = Object.fromEntries(searchParams.entries());
      if (vnp_ResponseCode === '00') {
        setPaymentStatus(true);
        toast.success("Payment for booking successfully.");
        processVnpReturn(queryParams);
      } else if (vnp_ResponseCode === '24') {
        setPaymentStatus(false);
        toast.error("Payment for booking failed!");
      }
    }
  }, [searchParams, navigate, processVnpReturn]);

  if (!searchParams) {
    return <Navigate to={"/"} replace />
  }

  return (
    <div className="w-full flex items-center justify-center mt-8">
      {paymentStatus ? (
        <TourBookingSuccess />
      ) : (
        <TourBookingFailed />
      )}
    </div>
  )
}

export default PaymentStatusPage