import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink, Outlet, useParams } from "react-router";
import { UserRound, Star, UserRoundCheck, Mail, Phone, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { useGetUserInfoByUsernameQuery } from "@/services/user-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { EditProfileModal } from "@/components/modals/edit-profile-modal";
import axios from "axios";

// Define the UserInfo type for user?.result
interface UserInfo {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth?: string;
    bio?: string;
    profilePicture?: string;
    coverPhoto?: string;
    role?: string;
    followers: any[];
    followings: any[];
}

interface UserResponse {
    result: UserInfo;
}

// Define the type for userInfo (authenticated user)
interface AuthUserInfo {
    _id: string;
    username: string;
    email: string;
    // Add other fields as needed
}

const ProfileLayout = () => {
    const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth) as {
        isAuthenticated: boolean;
        userInfo: AuthUserInfo | null;
    };
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Get username from URL
    const { username } = useParams<{ username: string }>();
    const { data: user, isLoading, refetch } = useGetUserInfoByUsernameQuery(username as string) as {
        data: UserResponse | undefined;
        isLoading: boolean;
        refetch: () => void;
    };

    // Log user and userInfo to debug
    console.log("User data:", user);
    console.log("Authenticated userInfo:", userInfo);

    // Handle save profile data with API call
    const handleSaveProfile = async (profileData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        city: string;
        dateOfBirth: string;
        introduction: string;
        avatar?: string | File;
        coverPhoto?: string | File;
    }) => {
        // Check if user is authenticated (based on Redux state or session)
        if (!isAuthenticated) {
            alert("You are not logged in. Please log in to update your profile.");
            window.location.href = "/login";
            return;
        }

        let userId = user?.result?._id || userInfo?._id;

        if (!userId) {
            try {
                const response = await axios.get("/api/v1/profiles/myInfo");
                userId = response.data.result?._id;
                console.log("Fetched user ID from myInfo:", userId);
            } catch (error) {
                console.error("Error fetching user ID from myInfo:", error);
                alert("Cannot update profile: Unable to fetch user ID.");
                return;
            }
        }

        if (!userId) {
            console.error("User ID is not available");
            alert("Cannot update profile: User ID is missing.");
            return;
        }

        // Validate payload
        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!fullName || !profileData.email) {
            alert("Full name and email are required.");
            return;
        }
        if (!emailRegex.test(profileData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("fullName", fullName);
            formData.append("email", profileData.email);
            formData.append("phoneNumber", profileData.phone);
            formData.append("address", profileData.city || "");
            formData.append("dateOfBirth", profileData.dateOfBirth || "");
            formData.append("bio", profileData.introduction || "");

            if (profileData.avatar instanceof File) {
                formData.append("profilePicture", profileData.avatar);
            } else {
                formData.append("profilePicture", user?.result?.profilePicture || "");
            }

            if (profileData.coverPhoto instanceof File) {
                formData.append("coverPhoto", profileData.coverPhoto);
            } else {
                formData.append("coverPhoto", user?.result?.coverPhoto || "");
            }

            console.log("Updating profile with data:", {
                userId,
                fullName,
                email: profileData.email,
                phoneNumber: profileData.phone,
                address: profileData.city || "",
                dateOfBirth: profileData.dateOfBirth || "",
                bio: profileData.introduction || "",
                profilePicture: profileData.avatar instanceof File ? profileData.avatar.name : profileData.avatar,
                coverPhoto: profileData.coverPhoto instanceof File ? profileData.coverPhoto.name : profileData.coverPhoto,
            });

            // Make the API call without Authorization header
            const response = await axios.put(`/api/v1/profiles/${userId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Profile updated successfully:", response.data);
            refetch();
            alert("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
                if (error.response.status === 401) {
                    alert("Session expired. Please log in again.");
                    window.location.href = "/login";
                } else {
                    alert(`Failed to update profile: ${error.response.data.error || "Unknown error"}`);
                }
            } else if (error.request) {
                console.error("No response received:", error.request);
                alert("Failed to update profile: No response from server. Please check your network connection.");
            } else {
                console.error("Error message:", error.message);
                alert(`Failed to update profile: ${error.message}`);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="w-full">
                <Skeleton className="w-full" />
            </div>
        );
    }

    // Split fullName into firstName and lastName (if fullName is available)
    const [firstName, lastName] = user?.result?.fullName?.split(" ") || ["", ""];

    return (
        <div className="w-full flex flex-col gap-5">
            <div className="relative w-full pt-8">
                {/* Cover Photo */}
                <img
                    src={user?.result?.coverPhoto || "https://placehold.co/1920x400"}
                    className="rounded-t-2xl w-full h-64 object-cover"
                />
                <div className="shadow-xl flex flex-col bg-white !rounded-b-xl rounded-t-[100px] pt-2 px-2 pb-3 -translate-y-40 max-w-[220px] absolute left-10">
                    {/* Avatar */}
                    <Avatar className="size-48 border border-border">
                        <AvatarImage src={user?.result?.profilePicture} />
                        <AvatarFallback>{user?.result?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-col justify-items-center">
                        <p className="font-bold text-2xl my-1 justify-center truncate max-w-44 pt-2 text-center">
                            {user?.result?.fullName}
                        </p>
                        {user?.result?.role === "TOUR_GUIDE" && (
                            <div className="flex items-center justify-center py-2">
                                <Star className="w-4 h-4 mx-1 stroke-amber-400" />
                                <p className="font-medium text-black text-sm">4.8 Excellent</p>
                            </div>
                        )}
                        <div className="flex items-center justify-center py-2">
                            <UserRound className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">
                                {user?.result?.followers.length} Follower
                            </p>
                        </div>
                        <div className="flex items-center justify-center py-2">
                            <UserRoundCheck className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">
                                {user?.result?.followings.length} Following
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Info and Edit Button */}
                <div className="flex justify-end items-start px-6 py-10 bg-white">
                    <div className="flex-col justify-items-start content-center">
                        <div className="flex items-center py-2">
                            <Mail className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600">{user?.result?.email}</p>
                        </div>
                        <div className="flex items-center py-2">
                            <Phone className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">
                                {user?.result?.phoneNumber}
                            </p>
                        </div>
                        <div className="flex items-center py-2">
                            <MapPin className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">
                                From {user?.result?.address || "N/A"}
                            </p>
                        </div>
                        <a href="#" className="mx-1 text-blue-900 font-medium underline py-2 text-sm">
                            More
                        </a>
                    </div>
                    <div className="my-2 mx-14 h-36 flex flex-col justify-items-start gap-2">
                        <p className="font-medium text-slate-600 text-sm">Introduction</p>
                        <textarea
                            name="bio"
                            value={user?.result?.bio || "No introduction available"}
                            disabled
                            className="w-[630px] h-[94px] text-sm resize-none py-2 px-3 bg-slate-200 rounded-b-xl rounded-r-xl"
                        />
                        {isAuthenticated && userInfo?.username === username && (
                            <Button
                                className="text-white !h-[34px] w-fit ml-auto"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-between border-t px-8 py-1 border-slate-200 rounded-b-2xl bg-white">
                    <div className="flex items-center">
                        <NavLink
                            to={`/${username}`}
                            end
                            className={({ isActive }) =>
                                cn(
                                    "bg-white px-4 py-2 font-medium text-sm",
                                    isActive ? "border-b-2 border-primary" : "text-muted-foreground"
                                )
                            }
                        >
                            Posts
                        </NavLink>
                        <NavLink
                            to={`/${username}/follow`}
                            className={({ isActive }) =>
                                cn(
                                    "bg-white px-4 py-2 font-medium text-sm",
                                    isActive ? "border-b-2 border-primary" : "text-muted-foreground"
                                )
                            }
                        >
                            Follow
                        </NavLink>
                        <NavLink
                            to={`/${username}/photos`}
                            className={({ isActive }) =>
                                cn(
                                    "bg-white px-4 py-2 font-medium text-sm",
                                    isActive ? "border-b-2 border-primary" : "text-muted-foreground"
                                )
                            }
                        >
                            Photos
                        </NavLink>
                        <NavLink
                            to={`/${username}/tours`}
                            className={({ isActive }) =>
                                cn(
                                    "bg-white px-4 py-2 font-medium text-sm",
                                    isActive ? "border-b-2 border-primary" : "text-muted-foreground"
                                )
                            }
                        >
                            Tours
                        </NavLink>
                        <NavLink
                            to={`/${username}/reviews`}
                            className={({ isActive }) =>
                                cn(
                                    "bg-white px-4 py-2 font-medium text-sm",
                                    isActive ? "border-b-2 border-primary" : "text-muted-foreground"
                                )
                            }
                        >
                            Reviews
                        </NavLink>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal with initial data */}
            {user?.result && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveProfile}
                    initialData={{
                        firstName: firstName || "",
                        lastName: lastName || "",
                        email: user?.result?.email || "",
                        phone: user?.result?.phoneNumber || "",
                        city: user?.result?.address || "",
                        dateOfBirth: user?.result?.dateOfBirth || "",
                        introduction: user?.result?.bio || "",
                        avatar: user?.result?.profilePicture || "",
                        coverPhoto: user?.result?.coverPhoto || "",
                    }}
                />
            )}

            {/* Outlet for child routes */}
            <Outlet />
        </div>
    );
};

export default ProfileLayout;