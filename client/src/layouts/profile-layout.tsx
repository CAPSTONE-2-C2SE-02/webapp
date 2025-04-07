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
import axiosInstance from "@/config/api";
import axios from "axios";

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

interface AuthUserInfo {
    _id: string;
    username: string;
    email: string;
}

const ProfileLayout = () => {
    const { isAuthenticated, userInfo, token } = useAppSelector((state) => state.auth) as {
        isAuthenticated: boolean;
        userInfo: AuthUserInfo | null;
        token: string | null;
    };
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { username } = useParams<{ username: string }>();
    const { data: user, isLoading, refetch } = useGetUserInfoByUsernameQuery(username as string) as {
        data: UserResponse | undefined;
        isLoading: boolean;
        refetch: () => void;
    };

    console.log("User data:", user);
    console.log("Authenticated userInfo:", userInfo);
    console.log("Auth token:", token);

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
        if (!isAuthenticated) {
            alert("You are not logged in. Please log in to update your profile.");
            window.location.href = "/login";
            return;
        }

        let userId = user?.result?._id || userInfo?._id;
        if (!userId) {
            try {
                const response = await axiosInstance.get("/profiles/myInfo");
                userId = response.data.result?._id;
                console.log("Fetched user ID from myInfo:", userId);
            } catch (error) {
                console.error("Error fetching user ID:", error);
                alert("Cannot update profile: Unable to fetch user ID.");
                return;
            }
        }

        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        if (!fullName) {
            alert("Full name is required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        const phoneRegex = /^[0-9]{10,11}$/;
        if (profileData.phone && !phoneRegex.test(profileData.phone)) {
            alert("Phone number must be 10-11 digits.");
            return;
        }
        const hasFiles = profileData.avatar instanceof File || profileData.coverPhoto instanceof File;

        let requestData;
        let headers: Record<string, string> = {
            "Authorization": `Bearer ${token}`
        };

        if (hasFiles) {
            const formData = new FormData();
            if (fullName) formData.append("fullName", fullName);

            const currentEmail = user?.result?.email || "";
            if (profileData.email && profileData.email !== currentEmail) {
                formData.append("email", profileData.email);
            }

            const currentPhone = user?.result?.phoneNumber || "";
            if (profileData.phone && profileData.phone !== currentPhone) {
                formData.append("phoneNumber", profileData.phone);
            }

            if (profileData.city) formData.append("address", profileData.city);
            if (profileData.introduction) formData.append("bio", profileData.introduction);

            if (profileData.dateOfBirth) {
                const birthDate = new Date(profileData.dateOfBirth);
                if (isNaN(birthDate.getTime())) {
                    alert("Invalid date of birth format.");
                    return;
                }
                const today = new Date();
                const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
                if (birthDate > minAgeDate) {
                    alert("You must be at least 13 years old.");
                    return;
                }
                formData.append("dateOfBirth", birthDate.toISOString().split("T")[0]);
            }

            if (profileData.avatar instanceof File) {
                formData.append("profilePicture", profileData.avatar);
            }
            if (profileData.coverPhoto instanceof File) {
                formData.append("coverPhoto", profileData.coverPhoto);
            }

            requestData = formData;
            headers["Content-Type"] = "multipart/form-data";
        } else {
            const jsonData: Record<string, any> = {};
            if (fullName) jsonData.fullName = fullName;

            const currentEmail = user?.result?.email || "";
            if (profileData.email && profileData.email !== currentEmail) {
                jsonData.email = profileData.email;
            }

            const currentPhone = user?.result?.phoneNumber || "";
            if (profileData.phone && profileData.phone !== currentPhone) {
                jsonData.phoneNumber = profileData.phone;
            }

            if (profileData.city) jsonData.address = profileData.city;
            if (profileData.introduction) jsonData.bio = profileData.introduction;

            if (profileData.dateOfBirth) {
                const birthDate = new Date(profileData.dateOfBirth);
                if (isNaN(birthDate.getTime())) {
                    alert("Invalid date of birth format.");
                    return;
                }
                const today = new Date();
                const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
                if (birthDate > minAgeDate) {
                    alert("You must be at least 13 years old.");
                    return;
                }
                jsonData.dateOfBirth = birthDate.toISOString().split("T")[0];
            }

            requestData = jsonData;
            headers["Content-Type"] = "application/json";
        }

        console.log("Sending request data:", requestData);
        if (hasFiles) {
            for (let [key, value] of requestData.entries()) {
                console.log(`${key}: ${value}`);
            }
        } else {
            console.log(JSON.stringify(requestData, null, 2));
        }

        try {
            console.log("Updating profile for user ID:", userId);
            console.log("Using token:", token);

            const response = await axios({
                method: 'put',
                url: `http://localhost:8080/api/v1/profiles/${userId}`,
                data: requestData,
                headers
            });

            console.log("Complete response:", response);
            if (response && response.data) {
                console.log("Profile update successful:", response.data);
                if (response.data.success) {
                    alert(response.data.message || "Profile updated successfully!");
                    refetch();
                } else {
                    console.error("API returned success:false", response.data);
                    alert("Profile update failed: " + (response.data.message || "Unknown error"));
                }
            } else {
                console.error("Response or response.data is undefined");
                alert("Profile update failed: No response data received");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            if (axios.isAxiosError(error) && error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                console.error(`Server responded with ${status}:`, errorData);
                if (errorData && errorData.error && Array.isArray(errorData.error)) {
                    const errorMessages = errorData.error.join('\n');
                    alert(`Failed to update profile: ${errorMessages}`);
                } else {
                    const errorMessage = errorData?.error || errorData?.message || "Unknown server error";
                    if (errorMessage === "Email already exists") {
                        alert("The email you entered is already in use. Please choose a different email.");
                    } else if (errorMessage === "Phone number already exists") {
                        alert("The phone number you entered is already in use. Please choose a different phone number.");
                    } else {
                        alert(`Failed to update profile: ${errorMessage}`);
                    }
                }
                if (status === 401) {
                    alert("Session expired. Please log in again.");
                    window.location.href = "/login";
                }
            } else if (axios.isAxiosError(error) && error.request) {
                console.error("No response received:", error.request);
                alert("No response from server. Check your network.");
            } else {
                if (error instanceof Error) {
                    console.error("Error details:", error.message);
                    alert(`Error: ${error.message}`);
                } else {
                    console.error("Error details:", error);
                    alert("Unknown error occurred");
                }
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

    const [firstName, lastName] = user?.result?.fullName?.split(" ") || ["", ""];

    return (
        <div className="w-full flex flex-col gap-5">
            <div className="relative w-full pt-8">
                <img
                    src={user?.result?.coverPhoto || "https://placehold.co/1920x400"}
                    className="rounded-t-2xl w-full h-64 object-cover"
                />
                <div className="shadow-xl flex flex-col bg-white !rounded-b-xl rounded-t-[100px] pt-2 px-2 pb-3 -translate-y-40 max-w-[220px] absolute left-10">
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
            <Outlet />
        </div>
    );
};

export default ProfileLayout;