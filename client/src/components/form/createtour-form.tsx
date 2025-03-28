import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { createTourSchema, CreateTourValues } from "@/lib/validations";
import { useCreateTourMutation } from "@/services/tours/tour-api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { useNavigate } from "react-router";
import { ErrorResponse } from "@/lib/types";

const CreateNewTourForm = () => {
    const [createTour, { isLoading, isError, isSuccess, error, data }] = useCreateTourMutation();
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const form = useForm<CreateTourValues>({
        resolver: zodResolver(createTourSchema),
        defaultValues: {
            title: "",
            departureLocation: "",
            destination: "",
            duration: 1,
            priceForAdult: 0,
            priceForYoung: 0,
            priceForChildren: 0,
            maxParticipants: 1,
            introduction: "",
            schedule: [{ title: "", description: "" }],
            include: "",
            notInclude: "",
            images: [],
        },
    });

    const navigate = useNavigate();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setUploadedImages(prev => {
                const updatedImages = [...prev, ...files];
                form.setValue("images", updatedImages);
                return updatedImages;
            });
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => {
            const updatedImages = prev.filter((_, i) => i !== index);
            form.setValue("images", updatedImages);
            return updatedImages;
        });
    };

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "schedule",
    });

    async function onSubmit(values: CreateTourValues) {
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === "images" && Array.isArray(value)) {
                    value.forEach((file) => {
                        formData.append("images", file as Blob);
                    });
                } else if (key === "schedule") {
                    formData.append("schedule", JSON.stringify(value));
                } else {
                    formData.append(key, value as string | Blob);
                }
            });

            await createTour(formData).unwrap();
        } catch (error) {
            console.error("Tour creation failed:", error);
            toast.error("Failed to create tour. Please try again.");
        }
    }

    useEffect(() => {
        if (isError) {
            toast.error((error as ErrorResponse).data.error)
        }
        if (isSuccess) {
            const response = JSON.parse(JSON.stringify(data));
            if (response?.success && response?.result) {
                toast.success("Create tour successfully");
                navigate(`/tours/${response?.result}`);
            }
        }
    }, [isError, isSuccess, error, data, navigate]);

    return (
        <div className="max-w-[1080px] mx-auto my-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
                <button className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold mx-auto">Create New Tour</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Tour name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: Tour Hoi An - Da Nang" {...field} className="h-11" />
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
                                            Departure Location <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="ex: Hoi An" {...field} className="h-11" />
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
                                            <Input placeholder="ex: Da Nang" {...field} className="h-11" />
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
                                            Duration <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number"
                                                min="1"
                                                placeholder="ex: 2 days 1 night, 1 day"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                className="h-11"
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
                                                placeholder="ex: 100$"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                className="h-11"
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
                                                placeholder="ex: 100$"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                className="h-11"
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
                                            Price for children <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="ex: 100$"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                className="h-11"
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
                                        Max number people per group <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="ex: 10 people"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            className="h-11" />
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
                                    <FormLabel className="text-gray-700 font-medium">Introduction
                                        <span className="text-red-500"> *</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your tour introduction......"
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
                                    <FormLabel className="text-gray-700 font-medium">Include
                                        <span className="text-red-500"> *</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your tour introduction......"
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
                                    <FormLabel className="text-gray-700 font-medium">Not Include
                                        <span className="text-red-500"> *</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your tour introduction......"
                                            {...field}
                                            className="min-h-[120px] resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormItem>
                            <FormLabel className="text-gray-600">Schedule
                                <span className="text-red-500"> *</span>
                            </FormLabel>
                            <div className=" border rounded-lg p-4 bg-white">
                                <div className="h-[580px] overflow-y-auto space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="relative border rounded-lg p-4 bg-white">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-semibold">Day {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name={`schedule.${index}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-600">Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Arrival and City Tour" {...field} className="h-11" />
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
                                                        <FormLabel className="text-gray-600">Description</FormLabel>
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
                                >
                                    + Add Day
                                </Button>
                            </div>
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Upload Images
                                        <span className="text-red-500"> *</span>
                                    </FormLabel>
                                    <FormControl >
                                        <div className="flex flex-col md:flex-row gap-4 w-full">
                                            <div
                                                className="border border-dashed border-gray-300 rounded-lg p-6 text-center w-full md:w-1/3 bg-gray-50 hover:bg-gray-100 cursor-pointer flex-shrink-0"
                                                onClick={() => document.getElementById("imageInput")?.click()}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const files = Array.from(e.dataTransfer.files);
                                                    const imageUrls = files.map((file) => URL.createObjectURL(file));
                                                    const updatedImages = [...(field.value || []), ...imageUrls];
                                                    field.onChange(updatedImages);
                                                }}
                                            >
                                                <ImagePlus className="mx-auto h-7 w-7 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Drop your image here, or{" "}
                                                    <span className="text-blue-600 cursor-pointer">Browse</span>
                                                </p>
                                                <Input
                                                    id="imageInput"
                                                    type="file"
                                                    multiple
                                                    accept="images/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </div>
                                            {uploadedImages && uploadedImages.length > 0 && (
                                                <Carousel className="flex-1 overflow-x-auto">
                                                    <CarouselContent>
                                                        {uploadedImages.map((image, index) => (
                                                            <CarouselItem key={index} className="basis-auto">
                                                                <div key={index} className="relative w-[120px] h-[120px] overflow-hidden rounded-md border">
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute right-1 top-1 h-6 w-6 "
                                                                        onClick={() => removeImage(index)}
                                                                    >
                                                                        <X className="h-4 w-4 " />
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
                                    <FormMessage className="min-h-[20px]" />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-between gap-4 mt-6 pt-5">
                            <Button
                                variant="outline"
                                className="border-gray-300 text-gray-600 w-full h-full"
                                onClick={() => form.reset()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-primary text-white hover:bg-blue-900 w-full h-full">
                                {isLoading && <Loader2 className="size-4 animate-spin" />}
                                Done
                            </Button>
                        </div>
                    </div>

                </form>
            </Form>
        </div>
    );
};

export default CreateNewTourForm;