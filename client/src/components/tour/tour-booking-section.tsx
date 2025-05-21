import { bookingSchema, BookingValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { checkAvailabilitySchedule, cn } from "@/lib/utils";
import { AlertCircle, ArrowUpRight, CalendarIcon, Minus, Plus } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Separator } from "../ui/separator";
import { addDays, format, isSameDay } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tour } from "@/lib/types";
import { useAppSelector } from "@/hooks/redux";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import useGetBusyDates from "@/hooks/useGetBusyDates";
import useAuthInfo from "@/hooks/useAuth";
import HoverUserCard from "../user/hover-user-card";

interface TourBookingSectionProps {
  tourData: Tour;
}

const TourBookingSection = ({ tourData }: TourBookingSectionProps) => {
  const auth = useAuthInfo();
  const [busyDates, setBusyDates] = useState<Date[]>([]);
  const [dateAvailability, setDateAvailability] = useState<{
    available: boolean
    conflictingDates?: Date[]
  }>({ available: true });
  
  // get busy date
  const { data: datesBusy } = useGetBusyDates(tourData.author._id, "TOUR_GUIDE");
  console.log(datesBusy?.dates)

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: { from: undefined, to: undefined },
      adults: 0,
      youths: 0,
      children: 0,
    }
  });
  
  useEffect(() => {
    // Update busy dates for the selected tour
    if (!datesBusy?.dates) return;
    const busyDates = datesBusy?.dates.map((date) => {
      if (date.status === "UNAVAILABLE") {
        return new Date(date.date);
      }
    }).filter((date) => date !== undefined);
    setBusyDates(busyDates);
    setDateAvailability({ available: true });
  }, [datesBusy?.dates]);

  const { watch, setError, clearErrors } = form;
  const adults = watch("adults");
  const youths = watch("youths");
  const children = watch("children");
  const dateRange = watch("dateRange");

  const totalParticipants = useMemo(() => adults + youths + children, [adults, youths, children]);

  const totalPrice = useMemo(
    () =>
      adults * tourData.priceForAdult +
      youths * tourData.priceForYoung +
      children * tourData.priceForChildren,
    [adults, youths, children, tourData]
  );

  const onSubmit = (values: BookingValues) => {
    if (!isAuthenticated) {
      toast.error("Please login to continue booking", {
        action: {
          label: "Login",
          onClick: () => navigate("/login", { state: { from: `/tours/${tourData._id}` } }),
        },
      });
      return;
    }
    navigate(`/tours/${tourData._id}/book`, {
      state: { ...values, tour: tourData, total: totalPrice },
    });
  }
  
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const availability = checkAvailabilitySchedule(dateRange, busyDates);
      setDateAvailability(availability);

      if (!availability.available) {
        setError("dateRange", {
          type: "manual",
          message: "Selected dates conflict with guide's schedule"
        });
      } else {
        clearErrors("dateRange");
      }
    }

    if (totalParticipants > tourData.maxParticipants) {
      setError("root.maxParticipants", {
        type: "manual",
        message: `Total participants (${totalParticipants}) exceed the maximum allowed (${tourData.maxParticipants}).`,
      });
    } else {
      clearErrors("root.maxParticipants");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, setError, clearErrors, totalParticipants, tourData.maxParticipants]);

  const isCurrentUser = auth?._id === tourData.author._id;

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-[88px] space-y-4">
        {/* tour guide info */}
        <div className="pr-1">
          <Card className="shadow-[4px_4px_oklch(0.392_0.0844_240.76)] border-primary">
            <CardHeader className="py-3 pb-0">
              <CardTitle className="text-center text-base text-primary">Tour Guide</CardTitle>
              <CardDescription className="sr-only">Tour Booking Section</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-3 select-none">
                <div className="w-10 h-10 rounded-full overflow-hidden border">
                  <img src={tourData.author.profilePicture} alt="tour guide avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <HoverUserCard user={tourData.author} />
                  <p className="leading-none text-xs text-gray-400 font-medium">@{tourData.author.username}</p>
                </div>
              </div>
              <Button className="rounded-full" size={"sm"} asChild>
                <Link to={isCurrentUser ? `/${tourData.author.username}` : `/messages/${tourData.author._id}`} className="text-xs" state={{ tour: tourData, sendTourImmediately: true }}>
                  {isCurrentUser ? "View Profile" : "Contact Now"}
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* booking form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl text-primary">Tour Booking</CardTitle>
            <CardDescription className="sr-only">Tour Booking Section</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField 
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tour Dates</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "PPP")} - {format(field.value.to, "PPP")}
                                  </>
                                ) : (
                                  format(field.value.from, "PPP")
                                )
                              ) : (
                                "From date - to date"
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            initialFocus
                            mode="range"
                            selected={field.value}
                            onSelect={(range) => {
                              field.onChange({
                                from: range?.from,
                                to: range?.from ? addDays(range.from, tourData.duration - 1) : undefined
                              })
                            }}
                            numberOfMonths={2}
                            disabled={(date) => {
                              if (date < new Date()) return true;
                              return busyDates.some((busy) => isSameDay(busy, date));
                            }}
                            modifiers={{
                              busy: busyDates,
                            }}
                            modifiersStyles={{
                              busy: {
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                color: "rgb(239, 68, 68)",
                                textDecoration: "line-through",
                              },
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!dateAvailability.available &&
                  dateAvailability.conflictingDates &&
                  dateAvailability.conflictingDates.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Scheduling Conflict</AlertTitle>
                      <AlertDescription>
                        <p>The selected dates conflict with the guide's schedule:</p>
                        <ul className="mt-2 list-disc list-inside">
                          {dateAvailability.conflictingDates.map((conflict, index) => (
                            <li key={index}>
                              {format(conflict, "MMM d")}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2">Please select different dates.</p>
                      </AlertDescription>
                    </Alert>
                  )
                }

                <div>
                  <h3 className="text-sm font-medium text-start mb-4">How many tickets?</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base">
                            <span className="text-primary">Adult (age 18–65)</span>
                            <div className="text-sm text-muted-foreground">${tourData.priceForAdult}</div>
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{field.value}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => field.onChange(field.value + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="youths"
                      render={({ field }) => (
                        <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base">
                            <span className="text-primary">Youth (age 12–17)</span>
                            <div className="text-sm text-muted-foreground">${tourData.priceForYoung}</div>
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{field.value}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => field.onChange(field.value + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base">
                            <span className="text-primary">Children (age 0–11)</span>
                            <div className="text-sm text-muted-foreground">${tourData.priceForChildren}</div>
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{field.value}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => field.onChange(field.value + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                      )}
                    />

                    {totalParticipants > tourData.maxParticipants && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Participant Limit Exceeded</AlertTitle>
                        <AlertDescription>
                          The total number of participants ({totalParticipants}) exceeds the maximum
                          allowed for this tour ({tourData.maxParticipants}). Please reduce the number of
                          participants.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/90 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">Total Price</span>
                    <span className="text-lg font-semibold text-primary">$ {totalPrice}</span>
                  </div>
                </div>
                
                {auth?.role === "TRAVELER" && (
                  <Button
                    type="submit"
                    className="w-full bg-primary"
                    size="lg"
                    disabled={
                      !form.formState.isValid || 
                      adults + youths + children === 0 || 
                      !dateAvailability.available ||
                      totalParticipants > tourData.maxParticipants
                    }
                    >
                    Booking Now
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TourBookingSection;
