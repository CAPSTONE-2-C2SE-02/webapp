import { useVnpReturn } from "@/services/bookings/booking-mutation";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function useHandleVnpReturn() {
  const [searchParams] = useSearchParams();
  const { mutate: processVnpReturn } = useVnpReturn();
  const navigate = useNavigate();

  useEffect(() =>  {
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

    if (vnp_ResponseCode) {
      const queryParams = Object.fromEntries(searchParams.entries());
      processVnpReturn(queryParams, {
        onSuccess: () => {
          if (vnp_ResponseCode === '00') {
            toast.success("Payment for booking successfully.");
            navigate('/payment-success');
          } else {
            toast.error("Payment for booking failed!");
            navigate('/payment-failure');
          }
        }
      })
    }
  }, [searchParams, navigate, processVnpReturn]);
}
