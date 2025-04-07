import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, CameraIcon, X } from "lucide-react";

// Utility function to format date to dd/mm/yyyy
const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Handle invalid date
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Utility function to parse dd/mm/yyyy back to ISO format for saving
const parseDDMMYYYYToISO = (dateString: string): string => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/").map(Number);
    if (!day || !month || !year) return "";
    const date = new Date(year, month - 1, day, 17, 0, 0); // Set time to 17:00:00 to match original
    return date.toISOString();
};

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (profileData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        city: string;
        dateOfBirth: string;
        introduction: string;
        avatar?: string | File;
        coverPhoto?: string | File;
    }) => void;
    initialData?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        city: string;
        dateOfBirth: string;
        introduction: string;
        avatar?: string;
        coverPhoto?: string;
    };
}

export function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
    const [profileData, setProfileData] = useState({
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        city: initialData?.city || "",
        dateOfBirth: formatDateToDDMMYYYY(initialData?.dateOfBirth || ""),
        introduction: initialData?.introduction || "",
        avatar: initialData?.avatar || "https://via.placeholder.com/150",
        coverPhoto: initialData?.coverPhoto || "https://via.placeholder.com/300x100",
        avatarFile: null as File | null,
        coverPhotoFile: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const avatarUrl = URL.createObjectURL(file);
            setProfileData((prev) => ({ ...prev, avatar: avatarUrl, avatarFile: file }));
        }
    };

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const coverPhotoUrl = URL.createObjectURL(file);
            setProfileData((prev) => ({ ...prev, coverPhoto: coverPhotoUrl, coverPhotoFile: file }));
        }
    };

    const handleSave = () => {
        const updatedProfileData = {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
            city: profileData.city,
            dateOfBirth: parseDDMMYYYYToISO(profileData.dateOfBirth),
            introduction: profileData.introduction,
            avatar: profileData.avatarFile || profileData.avatar,
            coverPhoto: profileData.coverPhotoFile || profileData.coverPhoto,
        };
        onSave(updatedProfileData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[425px] rounded-lg max-h-[90vh] flex flex-col"
                aria-describedby="edit-profile-description"
            >
                {/* Hidden description for accessibility */}
                <span id="edit-profile-description" className="sr-only">
                    A dialog to edit your profile information, including name, email, phone, city, birthday, and introduction.
                </span>

                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">Edit Profile</DialogTitle>

                </DialogHeader>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto space-y-4 px-4">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profileData.avatar} alt="Avatar" />
                                <AvatarFallback>
                                    {profileData.firstName.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-2 cursor-pointer"
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
                        <span className="mt-2 text-sm text-gray-500">Avatar</span>
                    </div>

                    {/* Cover Photo */}
                    <div className="relative">
                        <img
                            src={profileData.coverPhoto}
                            alt="Cover Photo"
                            className="w-full h-32 object-cover rounded-lg"
                        />
                        <label
                            htmlFor="cover-photo-upload"
                            className="absolute bottom-2 right-2 bg-gray-200 rounded-full p-2 cursor-pointer"
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
                        <span className="block mt-2 text-sm text-gray-500">Cover Photo</span>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <Input
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleInputChange}
                                className="mt-1 border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <Input
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleInputChange}
                                className="mt-1 border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <Input
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                className="mt-1 border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <Input
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                className="mt-1 border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                From City/Town
                            </label>
                            <Input
                                name="city"
                                value={profileData.city}
                                onChange={handleInputChange}
                                className="mt-1 border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Birthday
                            </label>
                            <div className="relative">
                                <Input
                                    name="dateOfBirth"
                                    value={profileData.dateOfBirth}
                                    onChange={handleInputChange}
                                    placeholder="dd/mm/yyyy"
                                    className="mt-1 border-gray-300 rounded-md"
                                />
                                <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Introduction
                        </label>
                        <textarea
                            name="introduction"
                            value={profileData.introduction}
                            onChange={handleInputChange}
                            placeholder="Enter your introduction..."
                            className="mt-1 w-full h-24 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Dialog Footer with Buttons */}
                <DialogFooter className="mt-4 flex justify-end gap-2 px-4 py-3 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-6 py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6 py-2"
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}