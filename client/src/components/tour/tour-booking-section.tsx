import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { BookingState, Tour } from "@/types/tour";

interface BookingSectionProps {
    tour: Tour;
}

export function BookingSection({ tour }: BookingSectionProps) {
    const [booking, setBooking] = useState<BookingState>({
        adults: 0,
        youths: 0,
        children: 0,
        fromDate: "",
        toDate: "",
        isCalendarOpen: false,
        selectedRange: { from: undefined, to: undefined },
    });

    const handleBookingChange = (field: keyof BookingState, value: number | string | boolean | DateRange) => {
        setBooking((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDateSelect = (range: DateRange | undefined) => {
        handleBookingChange("selectedRange", range || { from: undefined, to: undefined });
        if (range?.from) {
            handleBookingChange("fromDate", range.from.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }));
        }
        if (range?.to) {
            handleBookingChange("toDate", range.to.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }));
        }
        if (range?.from && range?.to) {
            handleBookingChange("isCalendarOpen", false);
        }
    };

    const calculateTotalPrice = () => {
        const adultPrice = booking.adults * tour.price;
        const youthPrice = booking.youths * tour.price * 0.8;
        const childrenPrice = booking.children * tour.price * 0.5;
        return (adultPrice + youthPrice + childrenPrice).toFixed(2);
    };

    return (
        <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 bg-white shadow-md sticky top-6">
                <h2 className="text-2xl font-bold mb-4 text-center text-teal-600">Booking</h2>
                <p className="text-xl font-semibold text-teal-700 flex items-center gap-2 mb-4">
                    <span className="text-2xl">$</span> {tour.price}
                </p>
                <hr className="border-gray-300 my-4" />
                <div className="mb-4 relative">
                    <label className="block text-gray-600 mb-2">From date - to date</label>
                    <div className="flex items-center">
                        <Input
                            type="text"
                            placeholder="Select date range"
                            className="w-full rounded-lg pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={booking.fromDate && booking.toDate ? `${booking.fromDate} - ${booking.toDate}` : ""}
                            onClick={() => handleBookingChange("isCalendarOpen", true)}
                            readOnly
                        />
                        <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 mt-4" />
                    </div>
                    {booking.isCalendarOpen && (
                        <div className="absolute z-10 mt-2">
                            <Calendar
                                mode="range"
                                selected={booking.selectedRange}
                                onSelect={handleDateSelect}
                                initialFocus={true}
                                className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                            />
                        </div>
                    )}
                </div>
                <hr className="border-gray-300 my-4" />
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-gray-600">Adults (Age 14+)</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleBookingChange("adults", Math.max(0, booking.adults - 1))}
                            >
                                -
                            </Button>
                            <Input
                                type="number"
                                value={booking.adults}
                                onChange={(e) => handleBookingChange("adults", parseInt(e.target.value) || 0)}
                                className="w-16 text-center"
                            />
                            <Button
                                variant="outline"
                                onClick={() => handleBookingChange("adults", booking.adults + 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="block text-gray-600">Youths (Age 6-13)</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleBookingChange("youths", Math.max(0, booking.youths - 1))}
                            >
                                -
                            </Button>
                            <Input
                                type="number"
                                value={booking.youths}
                                onChange={(e) => handleBookingChange("youths", parseInt(e.target.value) || 0)}
                                className="w-16 text-center"
                            />
                            <Button
                                variant="outline"
                                onClick={() => handleBookingChange("youths", booking.youths + 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="block text-gray-600">Children (Age 0-5)</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleBookingChange("children", Math.max(0, booking.children - 1))}
                            >
                                -
                            </Button>
                            <Input
                                type="number"
                                value={booking.children}
                                onChange={(e) => handleBookingChange("children", parseInt(e.target.value) || 0)}
                                className="w-16 text-center"
                            />
                            <Button
                                variant="outline"
                                onClick={() => handleBookingChange("children", booking.children + 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-300 my-4" />
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <p className="text-lg font-semibold text-teal-600">Total price: ${calculateTotalPrice()}</p>
                </div>
                <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">Booking Now</Button>
            </div>
        </div>
    );
}