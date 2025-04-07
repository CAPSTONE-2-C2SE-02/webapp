import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink, Outlet, useParams } from "react-router";
import { Cake, MessageSquare, UserRound, Star, UserRoundCheck, Mail, Phone, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { getUserByUsername } from "@/services/user-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { EditProfileModal } from "@/components/modals/edit-profile-modal";
import { useUserInfoQuery, useUpdateUserProfileMutation, handleSaveProfile } from "@/services/users/user-mutation";
import { UserInfo, EditProfileData } from "@/lib/types";
import FollowButton from "@/components/user/follow-button";
import { useQuery } from "@tanstack/react-query";

const ProfileLayout = () => {
    const { isAuthenticated, userInfo: authUserInfo, token } = useAppSelector((state) => state.auth) as {
        isAuthenticated: boolean;
        userInfo: { _id: string; username: string; email: string } | null;
        token: string | null;
    };
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { username } = useParams<{ username: string }>();
    const { data: user, isLoading } = useUserInfoQuery(username as string);
    const updateProfileMutation = useUpdateUserProfileMutation();

    const onSaveProfile = (profileData: EditProfileData) => {
        handleSaveProfile(profileData, {
            isAuthenticated,
            token,
            user,
            authUserInfo,
            updateProfileMutation,
        });
    };

    if (isLoading) {
        return (
            <div className="w-full">
                <Skeleton className="w-full" />
            </div>
        );
    }

    if (!user) {
        return <div>User not found</div>;
    }

    const [firstName, lastName] = user.fullName?.split(" ") || ["", ""];

    return (
        <div className="w-full flex flex-col gap-5">
            <div className="relative w-full pt-8">
                <img src="https://placehold.co/1920x400" className="rounded-t-2xl" />
                <div className="shadow-xl flex flex-col bg-white !rounded-b-xl rounded-t-[100px] [16px] pt-2 px-2 pb-3 -translate-y-40 max-w-[220px] absolute left-10">
                    <Avatar className="size-48 border border-border">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-col justify-items-center">
                        <p className="font-bold text-2xl my-1 justify-center truncate max-w-44 pt-2 text-center">{user.fullName}</p>
                        {user.role === "TOUR_GUIDE" && (
                            <div className="flex items-center justify-center py-2">
                                <Star className="w-4 h-4 mx-1 stroke-amber-400" />
                                <p className="font-medium text-black text-sm">4.8 Excellent</p>
                            </div>
                        )}
                        <div className="flex items-center justify-center py-2">
                            <UserRound className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">{user.followers.length} Follower</p>
                        </div>
                        <div className="flex items-center justify-center py-2">
                            <UserRoundCheck className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">{user.followings.length} Following</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-start px-6 py-10 bg-white">
                    <div className="flex-col justify-items-start content-center">
                        <div className="flex items-center py-2">
                            <Mail className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600">{user.email}</p>
                        </div>
                        <div className="flex items-center py-2">
                            <Phone className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">{user.phoneNumber}</p>
                        </div>
                        <div className="flex items-center py-2">
                            <MapPin className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">From {user.address || "N/A"}</p>
                        </div>
                        <a href="#" className="mx-1 text-blue-900 font-medium underline py-2 text-sm">
                            More
                        </a>
                    </div>
                    <div className="my-2 mx-14 h-36 flex flex-col justify-items-start gap-2">
                        <p className="font-medium text-slate-600 text-sm">Introduction</p>
                        <textarea
                            name="bio"
                            value={user.bio || "No introduction available"}
                            disabled
                            className="w-[630px] h-[94px] text-sm resize-none py-2 px-3 bg-slate-200 rounded-b-xl rounded-r-xl"
                        />
                        {isAuthenticated && authUserInfo?.username === username && (
                            <Button
                                className="text-white !h-[34px] w-fit ml-auto"
                                onClick={() => setIsEditModalOpen(true)}
                                disabled={updateProfileMutation.isPending}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex justify-between border-t px-8 py-1 border-slate-200 rounded-b-2xl bg-white">
                    <div className="flex items-center">
                        <NavLink
                            to={`/${username}`}
                            end
                            className={({ isActive }) =>
                                cn("bg-white px-4 py-2 font-medium text-sm", isActive ? "border-b-2 border-primary" : "text-muted-foreground")
                            }
                        >
                            Posts
                        </NavLink>
                        <NavLink
                            to={`/${username}/follow`}
                            className={({ isActive }) =>
                                cn("bg-white px-4 py-2 font-medium text-sm", isActive ? "border-b-2 border-primary" : "text-muted-foreground")
                            }
                        >
                            Follow
                        </NavLink>
                        <NavLink
                            to={`/${username}/photos`}
                            className={({ isActive }) =>
                                cn("bg-white px-4 py-2 font-medium text-sm", isActive ? "border-b-2 border-primary" : "text-muted-foreground")
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
            {user && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={onSaveProfile}
                    initialData={{
                        firstName: firstName || "",
                        lastName: lastName || "",
                        email: user.email || "",
                        phone: user.phoneNumber || "",
                        city: user.address || "",
                        dateOfBirth: user.dateOfBirth || "",
                        introduction: user.bio || "",
                        avatar: user.profilePicture || "",
                        coverPhoto: user.coverPhoto || "",
                    }}
                />
            )}
            <Outlet />
        </div>
    );
};

export default ProfileLayout;