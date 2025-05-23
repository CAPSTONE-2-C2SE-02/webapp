import { Tour } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFieldArray, useForm } from "react-hook-form";
import { createTourSchema, CreateTourValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LocationSelect from "@/components/form/location-select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useUpdateTour from "@/hooks/useUpdateTour";
import LoaderSpin from "@/components/utils/loader-spin";
import { toast } from "sonner";

interface EditTourDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour;
}

const EditTourDialog = ({
  isOpen,
  onOpenChange,
  tour,
}: EditTourDialogProps) => {
  const [existingImages, setExistingImages] = useState<string[]>(
    tour.imageUrls
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const { mutate: updateTour, isPending: isUpdating } = useUpdateTour();

  const form = useForm<CreateTourValues>({
    resolver: zodResolver(createTourSchema),
    defaultValues: {
      title: tour.title,
      introduction: tour.introduction,
      destination: tour.destination,
      departureLocation: tour.departureLocation,
      duration: tour.duration,
      priceForAdult: tour.priceForAdult,
      priceForYoung: tour.priceForYoung,
      priceForChildren: tour.priceForChildren,
      maxParticipants: tour.maxParticipants,
      schedule: tour.schedule,
      include: tour.include.join("\n"),
      notInclude: tour.notInclude.join("\n"),
      images: tour.imageUrls.map(
        (image) => new File([image], image, { type: "image/jpeg" })
      ),
    },
  });

  // Update form values when tour prop changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: tour.title,
        introduction: tour.introduction,
        destination: tour.destination,
        departureLocation: tour.departureLocation,
        duration: tour.duration,
        priceForAdult: tour.priceForAdult,
        priceForYoung: tour.priceForYoung,
        priceForChildren: tour.priceForChildren,
        maxParticipants: tour.maxParticipants,
        schedule: tour.schedule,
        include: tour.include.join("\n"),
        notInclude: tour.notInclude.join("\n"),
        images: tour.imageUrls.map(
          (image) => new File([image], image, { type: "image/jpeg" })
        ),
      });
      setExistingImages(tour.imageUrls);
      setNewImages([]);
    }
  }, [tour, isOpen, form]);

  const duration = form.watch("duration");
  const schedule = form.watch("schedule");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  // Sync schedule with duration
  useEffect(() => {
    const currentScheduleLength = schedule?.length || 0;
    
    if (currentScheduleLength < duration) {
        // Add missing days
        const daysToAdd = duration - currentScheduleLength;
        for (let i = 0; i < daysToAdd; i++) {
          append({ title: "", description: "" });
        }
    } else if (currentScheduleLength > duration) {
        // Remove extra days
        const daysToRemove = currentScheduleLength - duration;
        for (let i = 0; i < daysToRemove; i++) {
          remove(currentScheduleLength - 1 - i);
        }
    }
  }, [duration, schedule?.length, append, remove]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmitUpdate = async (values: CreateTourValues) => {
    try {
      // Validate schedule completion
      if (values.schedule?.some(day => !day.title || !day.description)) {
          toast.error("Please fill in all schedule details for each day");
          return;
      }

      // Validate images
      if (!values.images || values.images.length === 0) {
          toast.error("Please upload at least one image");
          return;
      }

      const formData = new FormData();
      
      formData.append("title", values.title);
      formData.append("introduction", values.introduction);
      formData.append("destination", values.destination);
      formData.append("departureLocation", values.departureLocation);
      formData.append("duration", values.duration.toString());
      formData.append("priceForAdult", values.priceForAdult.toString());
      formData.append("priceForYoung", values.priceForYoung.toString());
      formData.append("priceForChildren", values.priceForChildren.toString());
      formData.append("maxParticipants", values.maxParticipants.toString());
      formData.append("schedule", JSON.stringify(values.schedule));
      formData.append("include", values.include);
      formData.append("notInclude", values.notInclude);
      newImages.forEach((file) => {
        formData.append("images", file);
      });
      existingImages.forEach((image) => {
        formData.append("existingImages", image);
      });

      updateTour({ id: tour._id, formData }, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setNewImages([]);
        }
      });
    } catch (error) {
      console.error("Tour creation failed:", error);
      toast.error("Failed to create tour. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Tour</DialogTitle>
          <DialogDescription>{tour.title}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Tour name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Tour Hoi An - Da Nang"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departureLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Departure Location{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <LocationSelect
                          onChange={field.onChange}
                          placeholder="e.g. Hoi An"
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Destination <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <LocationSelect
                          onChange={field.onChange}
                          placeholder="e.g. Da Nang"
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Duration (days) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          placeholder="e.g. 2"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceForAdult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Price for adult <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 100$"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceForYoung"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Price for young <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 100$"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceForChildren"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Price for children{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 100$"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Max number people per group{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="e.g. 10 people"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="introduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Introduction
                      <span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. This place looks so peaceful!"
                        {...field}
                        className="min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="include"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Include
                      <span className="text-red-600"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g.&#10;Food and drink&#10;Hotel accommodation&#10;Transportation"
                        {...field}
                        className="min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notInclude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Not Include
                      <span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g.&#10;Personal expenses&#10;Travel insurance&#10;Airfare"
                        {...field}
                        className="min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 space-y-4">
              <FormItem>
                <FormLabel className="text-gray-600">
                  Schedule
                  <span className="text-red-500"> *</span>
                </FormLabel>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="h-[588px] overflow-y-auto space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative border rounded-lg p-4 bg-white"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">
                            Day {index + 1}
                          </h3>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        <FormField
                          control={form.control}
                          name={`schedule.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600">
                                Title
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Arrival and City Tour"
                                  {...field}
                                  className="h-10"
                                />
                              </FormControl>
                              <FormMessage className="min-h-[20px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`schedule.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel className="text-gray-600">
                                Description
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the activities for this day..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="min-h-[20px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 border-gray-300 text-gray-600"
                    onClick={() => append({ title: "", description: "" })}
                    disabled={fields.length >= duration}
                  >
                    + Add Day
                  </Button>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>

              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-gray-600">
                      Upload Images
                      <span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div
                          className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg text-center w-full md:w-[120px] h-[120px] bg-gray-50 hover:bg-gray-100 cursor-pointer flex-shrink-0"
                          onClick={() =>
                            document.getElementById("editImageInput")?.click()
                          }
                        >
                          <Input
                            id="editImageInput"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <ImagePlus className="mx-auto h-7 w-7 text-gray-400" />
                          <p className="mt-3 text-xs text-gray-400">
                            JPG, PNG, WebP up to 5MB
                          </p>
                        </div>
                        <Carousel className="flex-1 overflow-x-auto">
                          <CarouselContent>
                            {existingImages.map((url, idx) => (
                              <CarouselItem key={idx} className="basis-auto">
                                <div key={idx} className="relative w-[120px] h-[120px] overflow-hidden rounded-md border">
                                  <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute right-1 top-1 h-6 w-6 "
                                      onClick={() => removeImage(idx, true)}
                                  >
                                      <X className="h-4 w-4 " />
                                  </Button>
                                  <img
                                      src={url}
                                      alt={`Existing ${idx}`}
                                      className="object-cover w-full h-full"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                            {newImages.map((file, idx) => (
                              <CarouselItem key={idx} className="basis-auto">
                                <div key={idx} className="relative w-[120px] h-[120px] overflow-hidden rounded-md border">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-1 top-1 h-6 w-6"
                                    onClick={() => removeImage(idx, false)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`New ${idx}`}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex justify-between gap-4">
                <Button type="button" variant="outline" className="w-full h-full" onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="w-full h-full" disabled={isUpdating}>
                  {isUpdating ? (
                    <LoaderSpin text="Updating..." />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTourDialog;
