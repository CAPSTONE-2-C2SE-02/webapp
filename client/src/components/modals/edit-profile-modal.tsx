import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, CameraIcon } from "lucide-react";
import { EditProfileData } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileValues } from "@/lib/validations";
import { format, isAfter } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (profileData: EditProfileData) => void;
    initialData?: EditProfileData;
}

export function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
    const [avatarPreview, setAvatarPreview] = useState<string>(
        initialData?.avatar && typeof initialData.avatar === "string"
            ? initialData.avatar
            : "https://via.placeholder.com/150"
    );
    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>(
        initialData?.coverPhoto && typeof initialData.coverPhoto === "string"
            ? initialData.coverPhoto
            : "https://via.placeholder.com/300x100"
    );

    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            city: initialData?.city || "",
            dateOfBirth: initialData?.dateOfBirth
                ? new Date(initialData.dateOfBirth)
                : new Date(),
            introduction: initialData?.introduction || "",
            avatar: initialData?.avatar || "https://via.placeholder.com/150",
            coverPhoto: initialData?.coverPhoto || "https://via.placeholder.com/300x100",
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                firstName: initialData.firstName || "",
                lastName: initialData.lastName || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                city: initialData.city || "",
                dateOfBirth: initialData?.dateOfBirth
                    ? new Date(initialData.dateOfBirth)
                    : new Date(),
                introduction: initialData.introduction || "",
                avatar: initialData.avatar || "https://placehold.co/150",
                coverPhoto: initialData.coverPhoto || "https://placehold.co/800x400",
            });

            setAvatarPreview(
                initialData.avatar && typeof initialData.avatar === "string"
                    ? initialData.avatar
                    : "https://via.placeholder.com/150"
            );

            setCoverPhotoPreview(
                initialData.coverPhoto && typeof initialData.coverPhoto === "string"
                    ? initialData.coverPhoto
                    : "https://placehold.co/800x400"
            );
        }
    }, [initialData, form]);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const avatarUrl = URL.createObjectURL(file);
            setAvatarPreview(avatarUrl);
            setAvatarFile(file);
            form.setValue("avatar", file);
        }
    };

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const coverPhotoUrl = URL.createObjectURL(file);
            setCoverPhotoPreview(coverPhotoUrl);
            setCoverPhotoFile(file);
            form.setValue("coverPhoto", file);
        }
    };

    const onSubmit = (data: ProfileValues) => {
        const updatedProfileData: EditProfileData = {
            ...data,
            dateOfBirth: data.dateOfBirth,
            avatar: avatarFile || data.avatar,
            coverPhoto: coverPhotoFile || data.coverPhoto,
            phone: data.phone || "",
            city: data.city || "",
            introduction: data.introduction || "",
        };
        onSave(updatedProfileData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[625px] rounded-lg h-[90vh] flex flex-col overflow-hidden"
                aria-describedby="edit-profile-description"
            >
                <span id="edit-profile-description" className="sr-only">
                    A dialog to edit your profile information, including name, email, phone, city, birthday, and introduction.
                </span>
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-center text-lg font-semibold">Edit Profile</DialogTitle>
                    <DialogDescription className="sr-only">Edit your profile</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2 space-y-4">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={avatarPreview} alt="Avatar" />
                                        <AvatarFallback>{form.getValues("firstName").charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute -bottom-2 right-0 bg-white/80 backdrop-blur-sm border border-border rounded-full p-2 cursor-pointer"
                                    >
                                        <CameraIcon className="h-5 w-5 text-gray-600" />
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <span className="mt-2 text-sm text-primary font-medium">Avatar</span>
                            </div>

                            <div className="relative">
                                <img
                                    src={coverPhotoPreview}
                                    alt="Cover Photo"
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <label
                                    htmlFor="cover-photo-upload"
                                    className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm border border-border rounded-full p-2 cursor-pointer"
                                >
                                    <CameraIcon className="h-5 w-5 text-gray-600" />
                                </label>
                                <input
                                    id="cover-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleCoverPhotoChange}
                                />
                                <span className="block mt-2 text-sm text-primary font-medium">Cover Photo</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-primary">First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="mt-1 border-gray-300 rounded-md" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-primary">Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="mt-1 border-gray-300 rounded-md" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-primary">Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="mt-1 border-gray-300 rounded-md" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-primary">Phone Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="mt-1 border-gray-300 rounded-md" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-primary">From City/Town</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="mt-1 border-gray-300 rounded-md" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-primary">Birthday</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground",
                                                    )}
                                                    >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    <span>{field.value ? format(field.value, "dd/MM/yyyy") : "Pick a date"}</span>
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        captionLayout="dropdown-buttons"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => isAfter(date, new Date())}
                                                        initialFocus
                                                        fromYear={1900}
                                                        toYear={2050}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="introduction"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-primary">Introduction</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Enter your introduction..."
                                                className="mt-1 w-full h-20 rounded-md p-2 text-sm resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="shrink-0 px-4 py-3 border-t bg-white mt-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="rounded-full px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="rounded-full px-6"
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}