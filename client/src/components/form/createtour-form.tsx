import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "react-router";

const createTourSchema = z.object({
    nameOfTour: z.string().min(1, "Name of Tour is required"),
    departureLocation: z.string().min(1, "Departure Location is required"),
    destination: z.string().min(1, "Destination is required"),
    duration: z.string().min(1, "Duration is required"),
    priceForAdult: z.number().min(0, "Price for Adult must be a positive number"),
    priceForYoung: z.number().min(0, "Price for Young must be a positive number"),
    priceForChildren: z.number().min(0, "Price for Children must be a positive number"),
    introduction: z.string().min(1, "Introduction is required"),
    schedule: z.array(
        z.object({
            title: z.string().min(1, "Title is required"),
            description: z.string().min(1, "Description is required"),
        })
    ).optional(),
    include: z.string().min(1, "Include section is required"),
    notInclude: z.string().min(1, "Not Include section is required"),
    images: z.array(z.string()).optional(),
});

type CreateTourValues = z.infer<typeof createTourSchema>;

const CreateNewTourForm = () => {
    const form = useForm<CreateTourValues>({
        resolver: zodResolver(createTourSchema),
        defaultValues: {
            nameOfTour: "",
            departureLocation: "",
            destination: "",
            duration: "",
            priceForAdult: 0,
            priceForYoung: 0,
            priceForChildren: 0,
            introduction: "",
            schedule: [{ title: "", description: "" }],
            include: "",
            notInclude: "",
            images: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "schedule",
    });

    function onSubmit(values: CreateTourValues) {
        console.log(values);
    }

    const uploadedImages = form.watch("images") || [];

    const removeImage = (index: number) => {
        const updatedImages = uploadedImages.filter((_, i) => i !== index);
        form.setValue("images", updatedImages);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg mt-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <Link to="/tours" className="text-blue-600">
                    <ArrowLeft size={24} />
                </Link>
                <h2 className="text-2xl font-bold">Create New Tour</h2>
                <div className="w-6"></div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nameOfTour"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Name of Tour</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: TOUR HOI AN - DA NANG" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="departureLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Departure Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: HOI AN" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Duration</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: 2 days 1 night, 1 day" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priceForYoung"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Price for Young</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="ex: 100$"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="destination"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Destination</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: DA NANG" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priceForAdult"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Price for Adult</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="ex: 100$"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priceForChildren"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-600">Price for Children</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="ex: 100$"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="introduction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Introduction</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter your introduction..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="include"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Include</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter your introduction..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notInclude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Not Include</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter your introduction..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormItem>
                            <FormLabel className="text-gray-600">Schedule</FormLabel>
                            <div className="border rounded-lg p-4 bg-white">
                                <div className="max-h-96 overflow-y-auto space-y-4">
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
                                                            <Input placeholder="e.g., Arrival and City Tour" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
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
                                                        <FormMessage />
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
                                    <FormLabel className="text-gray-600">Upload Images</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div
                                                className="border border-dashed border-gray-300 rounded-lg p-6 text-center w-full md:w-1/3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
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
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Drop your image here, or{" "}
                                                    <span className="text-blue-600 cursor-pointer">Browse</span>
                                                </p>
                                                <Input
                                                    id="imageInput"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        const imageUrls = files.map((file) => URL.createObjectURL(file));
                                                        const updatedImages = [...(field.value || []), ...imageUrls];
                                                        field.onChange(updatedImages);
                                                        e.target.value = "";
                                                    }}
                                                />
                                            </div>
                                            {uploadedImages.length > 0 && (
                                                <div className="flex-1 overflow-x-auto">
                                                    <div className="flex flex-row gap-4">
                                                        {uploadedImages.map((image, index) => (
                                                            <div key={index} className="relative flex-shrink-0">
                                                                <img
                                                                    src={image}
                                                                    alt={`Uploaded ${index}`}
                                                                    className="h-48 w-48 object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(index)}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-600"
                        onClick={() => form.reset()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-900 text-white hover:bg-blue-700">
                        Done
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default CreateNewTourForm;