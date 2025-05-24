import { MapPin, Clock, Users, Star, ImagePlus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Booking, Review } from "@/lib/types";
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
import { createReview, deleteReview, fetchReviewByBookingId, updateReview } from "@/services/tours/review-api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getAbsoluteAddress } from "../utils/convert";
import LoaderSpin from "../utils/loader-spin";

interface ReviewTourProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewData?: Review | null; 
  isEditable: boolean;
}

const ReviewTourModal = ({ booking, open, onOpenChange, reviewData, isEditable }: ReviewTourProps) => {
  const queryClient = useQueryClient();
  const [editable, setEditable] = useState(isEditable);
  const [reviewExists, setReviewExists] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formState, setFormState] = useState<{
    existingImages: string[];
    images: File[];
    removedImages: string[];
  }>({
    existingImages: [],
    images: [],
    removedImages: [],
  });
  const form = useForm<CreateReviewValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      ratingForTour: 5,
      ratingForTourGuide: 5,
      reviewTour: "",
      reviewTourGuide: "",
      imageUrls: [],
    },
  });

  const { watch } = form;

  useEffect(() => {
    setEditable(isEditable);
  }, [isEditable, open]);

  useEffect(() => {
    console.log("Review Data in Modal:", reviewData);
    if (reviewData) {
      form.reset({
        ratingForTour: reviewData.ratingForTour,
        ratingForTourGuide: reviewData.ratingForTourGuide,
        reviewTour: reviewData.reviewTour,
        reviewTourGuide: reviewData.reviewTourGuide,
        imageUrls: reviewData.imageUrls || [],
      });
      setFormState({
        existingImages: reviewData.imageUrls || [],
        images: [],
        removedImages: [],
      });
      setHasChanges(false);
    } else {
      form.reset({
        ratingForTour: 5,
        ratingForTourGuide: 5,
        reviewTour: "",
        reviewTourGuide: "",
        imageUrls: [],
      });
      setFormState({
        existingImages: [],
        images: [],
        removedImages: [],
      });
      setHasChanges(false);
    }
  }, [reviewData, form]);

  // Watch for changes in the form fields
  useEffect(() => {
    const subscription = watch((value) => {
      if (!reviewData) return; 
      const hasFormChanged =
        value.ratingForTour !== reviewData.ratingForTour ||
        value.ratingForTourGuide !== reviewData.ratingForTourGuide ||
        value.reviewTour !== reviewData.reviewTour ||
        value.reviewTourGuide !== reviewData.reviewTourGuide ||
        formState.existingImages.length !== reviewData.imageUrls?.length ||
        formState.images.length > 0 ||
        formState.removedImages.length > 0;

      setHasChanges(hasFormChanged);
    });

    return () => subscription.unsubscribe();
  }, [watch, reviewData, formState]);

  // Check if the review exists when the modal opens
 useEffect(() => {
    const checkReviewStatus = async () => {
      if (open && booking._id) {
        try {
          const review = await fetchReviewByBookingId(booking._id);
          if (booking.isReview) {
            if (!review) {
              setReviewExists(false);
              setTimeout(() => {
                if (!isConfirmDeleteOpen) {
                  onOpenChange(false);
                }
              }, 30000); 
            } else {
              setReviewExists(true);
            }
          } else {
            setReviewExists(true);
          }
        } catch (error) {
          setReviewExists(false);
          toast.error("Unable to load review information. Please try again.");
          setTimeout(() => {
            if (!isConfirmDeleteOpen) {
              onOpenChange(false);
            }
          }, 30000);
        }
      }
    };

    checkReviewStatus();
  }, [open, booking._id, booking.isReview, onOpenChange, isConfirmDeleteOpen]);

  const { mutate: createReviewMutation, isPending: isCreatingReview } = useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Review created successfully");
        queryClient.invalidateQueries({ queryKey: ["travelerBookings"] });
        onOpenChange(false);
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.error || "Failed to create review. Please try again.");
      }
      console.error("Create review error:", error);
    },
  });

  const { mutate: updateReviewMutation, isPending: isUpdatingReview } = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: Partial<CreateReviewValues> & { existingImages?: string[]; removedImages?: string[] } }) => updateReview(reviewId, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Review updated successfully");
        queryClient.invalidateQueries({ queryKey: ["travelerBookings"] });
        queryClient.invalidateQueries({ queryKey: ["reviews", booking.tourId._id ] });
        queryClient.invalidateQueries({ queryKey: ["review", reviewData?._id ] });
        onOpenChange(false);
      }
    },
    onError: (error) => {
      console.error("Update review error:", error);
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.error || "Failed to update review.");
      }
    },
  });

  const { mutate: deleteReviewMutation, isPending: isDeletingReview } = useMutation({
  mutationFn: deleteReview,
  onSuccess: (data) => {
    if (data.success) {
      toast.success("Deleted review successfully");
      queryClient.invalidateQueries({ queryKey: ["travelerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", booking.tourId._id] });
      queryClient.invalidateQueries({ queryKey: ["review", reviewData?._id] });
      setReviewExists(false); 
      setIsConfirmDeleteOpen(false); 
      onOpenChange(false); 
    }
  },
  onError: (error) => {
    console.error("Delete fail review:", error);
    if (error instanceof AxiosError) {
      toast.error(error?.response?.data?.error || "Delete fail review. please try again.");
    }
    setIsConfirmDeleteOpen(false);
  },
});

  const totalPeople = booking.adults + booking.youths + booking.children;

  const onSubmit = async (values: CreateReviewValues) => {
    const files = values.imageUrls.filter((item) => item instanceof File);
    const existingUrls = values.imageUrls.filter((item) => typeof item === "string");
    const payload = {
      ...values,
      imageUrls: [...existingUrls, ...files],
      bookingId: booking._id,
      existingImages: formState.existingImages, 
      removedImages: formState.removedImages,
    };
  
    if (reviewData && reviewData._id) {
      console.log("Update payload:", payload);
      updateReviewMutation({
        reviewId: reviewData._id,
        data: payload,
      });
    } else {
      createReviewMutation(payload);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const remainingSlots = 5 - (formState.existingImages.length + formState.images.length);
      if (remainingSlots <= 0) {
        toast.error("You can only upload up to 5 images.");
        return;
      }
      const newImages = files.slice(0, remainingSlots);
      setFormState((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      form.setValue("imageUrls", [...formState.existingImages, ...formState.images, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageToRemove = formState.existingImages[index];
      setFormState((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
        removedImages: [...prev.removedImages, imageToRemove],
      }));
      form.setValue("imageUrls", [
        ...formState.existingImages.filter((_, i) => i !== index),
        ...formState.images,
      ]);
    } else {
      setFormState((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
      form.setValue("imageUrls", [
        ...formState.existingImages,
        ...formState.images.filter((_, i) => i !== index),
      ]);
    }
  };
  
  const handleDelete = () => {
    if (reviewData?._id) {
      setIsConfirmDeleteOpen(true); 
    }
  };

  const confirmDelete = () => {
    if (reviewData?._id) {
      deleteReviewMutation(reviewData._id); 
    }
  };

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false); 
  };
  // Close the dialog when the user clicks outside of it
  const handleCloseDialog = () => {
    onOpenChange(false);
  };

  if (!reviewExists) {
    return (
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-primary text-center">Notification</DialogTitle>
            <DialogDescription className="sr-only">
              Review has been deleted.
            </DialogDescription>
          </DialogHeader>
          <div>
            <p className="text-center text-gray-500">
              The review for this tour has been removed. Please contact support for more information.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  

  return (
    <>
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Review</DialogTitle>
          <DialogDescription>
            Please provide your feedback for the tour and tour guide.
          </DialogDescription>
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
            <h3 className="font-semibold text-sm text-primary line-clamp-2">{booking.tourId.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(booking.startDate), "dd/MM/yyyy")} -{" "}
              {format(new Date(booking.endDate), "dd/MM/yyyy")}
            </p>

            <div className="flex items-center mt-2">
              <MapPin className="h-3 w-3 text-teal-600" />
              <span className="text-xs text-teal-600 ml-1">
                 {getAbsoluteAddress(booking.tourId.destination, booking.tourId.departureLocation)}
              </span>
            </div>

            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-teal-600" />
                <span className="text-xs ml-1">{booking.tourId.duration} Days</span>
              </div>

              <div className="flex items-center">
                <Users className="h-4 w-4 text-teal-600" />
                <span className="text-xs ml-1">{totalPeople}</span>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ratingForTour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Rating for Tour</FormLabel>
                  <FormControl>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          disabled={!editable }
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
              name="reviewTour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Tour Review</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={!editable }
                      placeholder="Type your message here."
                      {...field}
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ratingForTourGuide"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Rating for Tour Guide</FormLabel>
                  <FormControl>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          disabled={!editable }
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
              name="reviewTourGuide"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Tour Guide Review</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={!editable }
                      placeholder="Type your message here."
                      {...field}
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Upload Images 
                  </FormLabel>
                    <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {editable && (
                            <label className="w-[120px] h-[120px] p-2 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                              <ImagePlus className="h-6 w-6 text-gray-400" />
                              <span className="text-xs text-gray-500 text-center mt-1">
                                Upload your image here or select Browse
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                disabled={!editable}
                                multiple
                                onChange={handleImageUpload}
                              />
                            </label>
                          )}
                          {[...formState.existingImages, ...formState.images].length > 0 && (
                            <Carousel className="flex-1 overflow-x-auto">
                              <CarouselContent>
                                {formState.existingImages.map((image, index) => (
                                  <CarouselItem key={`existing-${index}`} className="basis-auto">
                                    <div className="relative w-[120px] h-[120px] overflow-hidden rounded-md border">
                                      {editable && (
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute right-1 top-1 h-6 w-6"
                                          onClick={() => handleRemoveImage(index, true)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <img
                                        src={image}
                                        alt={`Existing image ${index + 1}`}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  </CarouselItem>
                                ))}
                                {formState.images.map((image, index) => (
                                  <CarouselItem key={`new-${index}`} className="basis-auto">
                                    <div className="relative w-[120px] h-[120px] overflow-hidden rounded-md border">
                                      {editable && (
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute right-1 top-1 h-6 w-6"
                                          onClick={() => handleRemoveImage(index, false)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
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
              {editable ? (
                (reviewData ? hasChanges : true) ? (
                <Button type="submit" disabled={isCreatingReview || isUpdatingReview}>
                  {isCreatingReview || isUpdatingReview ? (
                    <LoaderSpin text={isCreatingReview ? "Creating..." : "Updating..."} />
                  ) : "Send" }
                </Button>
                ) : null
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditable(true)}>
                    Edit
                  </Button>
                  <Button 
                    type="button"
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isDeletingReview}
                  >
                    {isDeletingReview ? <LoaderSpin text="Deleting..." /> : "Delete"}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeletingReview}
            >
              {isDeletingReview ? <LoaderSpin text="Deleting..." /> : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewTourModal;