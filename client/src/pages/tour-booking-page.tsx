import CancelPolicyPopup from "@/components/modals/cancel-policy-popup";
import ReservePopup from "@/components/modals/reserve-popup";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import MetaData from "@/components/utils/meta-data";
import ScrollToTopOnMount from "@/components/utils/scroll-to-top-mount";
import useAuthInfo from "@/hooks/useAuth";
import useBookingPayment from "@/hooks/useBookingPayment";
import { Tour } from "@/lib/types";
import { bookingFormSchema, BookingFormValues } from "@/lib/validations";
import { useGetPaymentBooking } from "@/services/bookings/booking-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router"

interface LocationState {
  inprocess: boolean;
  tour: Tour;
  dateRange: {
    from: Date;
    to: Date;
  };
  adults: number;
  youths: number;
  children: number;
  total: number;
}

const TourBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuthInfo();

  const [bookingId, setBookingId] = useState("");

  const state = location.state as LocationState;

  const { handlePaymentNow, isCreatingBooking, isCreatingPayment } = useBookingPayment();
  const {
    data: paymentURL,
    isPending: isGetPaymentUrl
  } = useGetPaymentBooking(bookingId);

  // will using paymentURL and redirect to it
  console.log(bookingId);
  console.log(paymentURL);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: auth?.fullName || "",
      email: auth?.email || "",
      country: "",
      phoneNumber: auth?.phoneNumber || "",
      address: auth?.address || "",
      city: "",
      note: "",
      type: "payment",
    },
  });

  const handlePaymentBooking = async (data: BookingFormValues) => {
    const bookingData = {
      ...data,
      tourId: state.tour._id,
      startDate: state.dateRange.from,
      endDate: state.dateRange.to,
      adults: state.adults,
      youths: state.youths,
      children: state.children,
      total: state.total,
      isPayLater: data.type === "reserve"
    };
    handlePaymentNow(bookingData, (bookId) => {
      setBookingId(bookId);
    });
  };

  const paymentStatus = form.watch("type");
  const isReserve = paymentStatus === "reserve";

  useEffect(() => {
    if (!state || !state.tour || !state.dateRange) {
      navigate("/tours", { replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    if (paymentURL?.success && paymentURL.result) {
      if (isReserve) {
        navigate("/booking-history", { replace: true });
      } else {
        window.location.href = paymentURL.result.paymentUrl;
      }
    }
  }, [navigate, paymentURL?.result, paymentURL?.success, isReserve]);

  return (
    <>
      <MetaData title="Tour Booking" />
      <ScrollToTopOnMount />
      <div className="max-w-xs sm:max-w-sm md:max-w-[1080px] mx-auto my-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Button size={"icon"} variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold mx-auto text-primary">Booking Tour</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* booking form */}
          <Form {...form}>
            <form className="col-span-1 lg:col-span-3 space-y-3" onSubmit={form.handleSubmit(handlePaymentBooking)}>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ngoc Duc" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Viet Nam" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+84 356 998 JQK" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="tripconnect@dev.vn" type="email" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="51 Ton Dan - Hoa An" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">
                      Town/City <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Da Nang" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">
                      Note
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your note..."
                        className="resize-none min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Choose payment method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="payment" />
                          </FormControl>
                          <FormLabel className="text-sm">
                            <p className="font-medium text-primary">Payment application supports VNPay</p>
                            <CancelPolicyPopup />
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="reserve" />
                          </FormControl>
                          <FormLabel className="text-sm">
                            <p className="font-medium text-primary">Reserve Now & Pay Later</p>
                            <ReservePopup />
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isCreatingBooking || isCreatingPayment}>
                {isCreatingBooking && isCreatingPayment && isGetPaymentUrl ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Paying...
                  </>
                ) : (
                  <>Pay now</>
                )}
              </Button>
            </form>
          </Form>

          {/* tour information */}
          <div className="col-span-1 lg:col-span-2 bg-sky-100 px-7 py-4 border border-sky-200 rounded-lg">
            <h2 className="text-lg font-bold text-primary text-center mb-8">Your Order Information</h2>
            <div className="space-y-6">
              {/* tour */}
              <div className="bg-white px-5 py-3 rounded-md border border-border">
                <p className="text-sm italic"><span className="font-medium not-italic">Tour:</span> {state?.tour?.title}</p>
                <p className="text-sm">
                  <span className="font-medium">Tour Guide:</span>{" "}
                  <Link to={`/${state?.tour?.author?.username}`} target="_blank" className="underline">
                    {state?.tour?.author?.fullName}
                  </Link>
                </p>
              </div>
              <p className="text-sm font-medium bg-white border border-primary/60 border-dashed rounded-md">
                <span className="px-3 py-2 inline-block bg-teal-400 rounded-l-md">Duration</span>
                <span className="px-3 py-2 border-l border-primary/60 border-dashed">
                  {isValid(new Date(state?.dateRange?.from)) && isValid(new Date(state?.dateRange?.to)) ? (
                    `${format(new Date(state?.dateRange?.from), "dd/MM/yyyy")} - ${format(new Date(state?.dateRange?.to), "dd/MM/yyyy")}`
                  ) : (
                    "Invalid date range"
                  )}
                </span>
              </p>
              <div className="py-5 px-2 border-t border-b border-primary/40 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Adults - <span className="bg-teal-400/50 px-2 py-0.5 rounded-sm">${state?.tour?.priceForAdult}</span></span>
                  <span>{state?.adults}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Young - <span className="bg-teal-400/50 px-2 py-0.5 rounded-sm">${state?.tour?.priceForYoung}</span></span>
                  <span>{state?.youths}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Children - <span className="bg-teal-400/50 px-2 py-0.5 rounded-sm">${state?.tour?.priceForChildren}</span></span>
                  <span>{state?.children}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm font-medium py-3 px-4 bg-white rounded-md border border-border">
                <span>Total</span>
                <span className="text-primary font-bold">
                  ${state?.total}
                </span>
              </div>

              <div className="text-sm text-primary">
                <span className="font-medium">VNPay</span>
                <p>Pay with VNPay. Fast, convenient and Absolutely safe for all transactions</p>
              </div>
            </div> 
          </div>
        </div>
      </div>
    </>
  )
}

export default TourBookingPage