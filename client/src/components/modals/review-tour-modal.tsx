import { MapPin, Clock, Users, Star, ImagePlus, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Booking } from "@/lib/types";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
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
import { createReviewSchema, CreateReviewValues } from "@/lib/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/services/tours/review-api";
import { toast } from "sonner";

interface ReviewTourProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewTourModal = ({ booking, open, onOpenChange }: ReviewTourProps) => {
  const queryClient = useQueryClient();

  const form = useForm<CreateReviewValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 4,
      tourReview: "",
      guideReview: "",
      images: [],
    },
  });

  const { mutate: createReviewMutation, isPending: isLoading } = useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Review created successfully");
        queryClient.invalidateQueries({ queryKey: ["travelerBookings"] });
        onOpenChange(false);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to create review. Please try again.");
    },
  });

  const totalPeople = booking.adults + booking.youths + booking.children;

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const remainingSlots = 5 - (form.getValues("images")?.length || 0);
      if (remainingSlots <= 0) {
        toast.error("You can only upload up to 5 images.");
        return;
      }
      const newImages = files.slice(0, remainingSlots);
      form.setValue("images", [...(form.getValues("images") || []), ...newImages]);
    }
  };

  const onSubmit = async (values: CreateReviewValues) => {
    createReviewMutation({
      ...values,
      bookingId: booking._id,
    });
  };

  // Giải phóng URL khi modal đóng
  const handleClose = (open: boolean) => {
    if (!open) {
      const images = form.getValues("images") || [];
      images.forEach((image) => {
        const url = URL.createObjectURL(image);
        URL.revokeObjectURL(url);
      });
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Review</DialogTitle>
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
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Rating</FormLabel>
                  <FormControl>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="text-2xl text-yellow-400 focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= field.value ? "fill-yellow-400" : ""}`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tourReview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Tour Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here."
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guideReview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Tour Guide Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here."
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Upload Images <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      <label className="w-[120px] h-[120px] border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <ImagePlus className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 text-center mt-1">
                          Upload your image here or select Browse
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const remainingSlots = 5 - (field.value?.length || 0);
                              if (remainingSlots <= 0) {
                                toast.error("You can only upload up to 5 images.");
                                return;
                              }
                              const newImages = files.slice(0, remainingSlots);
                              field.onChange([...(field.value || []), ...newImages]);
                            }
                          }}
                        />
                      </label>

                      {field.value && field.value.length > 0 && (
                        <Carousel className="flex-1 overflow-x-auto">
                          <CarouselContent>
                            {field.value.map((image, index) => (
                              <CarouselItem key={index} className="basis-auto">
                                <div className="relative w-[120px] h-[120px] overflow-hidden rounded-md border">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-1 top-1 h-6 w-6"
                                    onClick={() => {
                                      const updatedImages = field.value.filter(
                                        (_, i) => i !== index
                                      );
                                      field.onChange(updatedImages);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Uploaded image ${index + 1}`}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                Send
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewTourModal;