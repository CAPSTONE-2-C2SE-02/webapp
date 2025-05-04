import { MapPin, Clock, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Booking } from "@/lib/types";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cancelTourValues, CancelTourValues } from "@/lib/validations";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCancel } from "@/services/bookings/booking-api";
import { toast } from "sonner";
import { useEffect } from "react";

interface CancelTourProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditable: boolean; 
}

const CancelTourModal = ({ booking, open, onOpenChange, isEditable }: CancelTourProps) => {
    const queryClient = useQueryClient();
    const form = useForm<CancelTourValues>({
      resolver: zodResolver(cancelTourValues),
      defaultValues: {
        secretKey: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        reason: "",
      },
    });
    useEffect(() => {
        if (booking) {
          form.reset({
            secretKey: booking.secretKey,
            fullName: booking.fullName,
            email: booking.email,
            phoneNumber: booking.phoneNumber,
            reason: booking.cancellationReason || "",
          });
        }
      }, [booking, form]);

    const { mutate: createCancelMutation} = useMutation({
        mutationFn: createCancel,
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Cancel tour created successfully");
            queryClient.invalidateQueries({ queryKey: ["CancelBooking"] });
            // queryClient.setQueryData<Booking[]>(
            //     bookingsQueryKey,
            //     (old) =>
            //       old?.map((b) =>
            //         b._id === booking._id ? { ...b, status: "CANCELED" } : b
            //       )
            //   );
            onOpenChange(false);
          }
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to cancel tour. Please try again.");
        },
      });

    const totalPeople = booking.adults + booking.youths + booking.children;
    const handleClose = () => {
        onOpenChange(false);
    };

    const onSubmit = async (values: CancelTourValues) => {
        createCancelMutation({
            ...values,
            bookingId: booking._id,
        })
    };

    return (
    
        <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle className="text-center text-xl">Cancel </DialogTitle>
            </DialogHeader>

            <div className="border rounded-lg overflow-hidden flex bg-white shadow-sm mb-4">
            <div className="w-48 p-1">
                <img
                src={booking.tourId.imageUrls[0]}
                alt={booking.tourId.title}
                className="h-full rounded-md"
                />
            </div>

            <div className="flex-1 p-4">
                <h3 className="font-medium text-sm">{booking.tourId.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                {format(new Date(booking.startDate), "dd/MM/yyyy")} -{" "}
                {format(new Date(booking.endDate), "dd/MM/yyyy")}
                </p>

                <div className="flex items-center mt-2">
                <MapPin className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-500 ml-1">
                    {booking.tourId.departureLocation} - {booking.tourId.destination}
                </span>
                </div>

                <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-xs ml-1">{booking.tourId.duration} Days</span>
                </div>

                <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-xs ml-1">{totalPeople}</span>
                </div>
                </div>
            </div>
            </div>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="secretKey"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-gray-700">
                            Booking Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                            <Input disabled={!isEditable} placeholder="SM-123456" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-gray-700" >
                            Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                            <Input disabled={!isEditable} placeholder="Ngoc Anh" {...field}/>
                        </FormControl>
                        <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem className="space-y-1">
                                <FormLabel className="text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </FormLabel>
                            <FormControl>
                                <Input disabled={!isEditable} placeholder="pans@gmail.com" {...field} />
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
                                <Input disabled={!isEditable} placeholder="+84 356 998 " {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-medium">Tour Review</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Type your message here."
                                {...field}
                                className="min-h-[100px]"
                                disabled={!isEditable}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {isEditable && (
                    <div>
                        <p className="italic font-light"> 
                            <span className="text-red-500">* </span> 
                            Note: phone number and email must match booking information 
                        </p>
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Send
                    </Button>
                </div>
               
            </form>
            </Form>
        </DialogContent>
        </Dialog>
  );
};

export default CancelTourModal;