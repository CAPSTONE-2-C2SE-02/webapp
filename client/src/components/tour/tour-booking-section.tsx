import { bookingSchema, BookingValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, CalendarIcon, DollarSign, Minus, Plus } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Separator } from "../ui/separator";
import { format, isSameDay } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { TourDetail } from "@/lib/types";
import { useAppSelector } from "@/hooks/redux";
import { toast } from "sonner";

interface TourBookingSectionProps {
  toursGuide: TourDetail['tourGuides'];
  price: number;
}

const TourBookingSection = ({ toursGuide, price }: TourBookingSectionProps) => {
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [busyDates, setBusyDates] = useState<Date[]>([]);
  const [dateAvailability, setDateAvailability] = useState<{
    available: boolean
    conflictingDates?: Date[]
  }>({ available: true });
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: {
        from: undefined,
        to: undefined,
      },
      adults: 0,
      youths: 0,
      children: 0,
    }
  });

  useEffect(() => {
    // Update busy dates for the selected tour
    setBusyDates(toursGuide.busyDates);
    setDateAvailability({ available: true });
  }, [])

  const adults = form.watch("adults");
  const youths = form.watch("youths");
  const children = form.watch("children");
  const dateRange = form.watch("dateRange")

  useEffect(() => {
    const total = (adults + youths + children) * price;
    setTotalPrice(total);
  }, [adults, youths, children, price]);

  const onSubmit = (values: BookingValues) => {
    if (!isAuthenticated) {
      toast.error("Please login to continue booking", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
      return;
    }
    console.log(values);
  }

  const checkAvailabilitySchedule = (dateRange: { from: Date; to: Date }): { available: boolean; conflictingDates: Date[] } => {
    const conflict = busyDates.filter((busy) => {
      const date = new Date(busy);
      return date >= dateRange.from && date <= dateRange.to;
    })

    return {
      available: conflict.length === 0,
      conflictingDates: conflict,
    }
  }
  
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const availability = checkAvailabilitySchedule(dateRange);
      setDateAvailability(availability);

      if (!availability.available) {
        form.setError("dateRange", {
          type: "manual",
          message: "Selected dates conflict with guide's schedule"
        });
      } else {
        form.clearErrors("dateRange");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, form]);

  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-[88px]">
        <CardHeader>
          <CardTitle className="text-center text-xl text-primary">Tour Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>{price}</span>
                /person
              </div>
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
                          onSelect={field.onChange}
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
                <h3 className="text-base font-medium text-center mb-4">Customer Types</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-base">Adults (Age 14-80)</FormLabel>
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
                        <FormLabel className="text-base">Youths (Age 6-13)</FormLabel>
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
                        <FormLabel className="text-base">Children (Age 0-5)</FormLabel>
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
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Total Price</span>
                  <span className="text-lg font-semibold text-primary">$ {totalPrice}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary"
                size="lg"
                disabled={!form.formState.isValid || adults + youths + children === 0 || !dateAvailability.available}
              >
                Booking Now
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourBookingSection;
