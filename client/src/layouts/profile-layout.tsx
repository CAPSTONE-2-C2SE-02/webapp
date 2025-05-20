import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, NavLink, Outlet, useParams } from "react-router";
import { Cake, MessageSquare, UserRound, Star, UserRoundCheck, Mail, Phone, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
// import { getUserByUsername } from "@/services/user-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { EditProfileModal } from "@/components/modals/edit-profile-modal";
import { useUserInfoQuery, useUpdateUserProfileMutation, handleSaveProfile } from "@/services/users/user-mutation";
import { EditProfileData } from "@/lib/types";
import FollowButton from "@/components/user/follow-button";
import { format } from "date-fns";
import { generateRatingText } from "@/components/utils/convert";

const ProfileLayout = () => {
    const { isAuthenticated, userInfo: authUserInfo } = useAppSelector((state) => state.auth) as {
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
    const isFollowing = user?.followers.map(item => item._id)?.includes(authUserInfo?._id ?? "") as boolean;
    
    return (
        <div className="w-full flex flex-col gap-5">
            <div className="relative w-full mt-5 px-2 pt-2 rounded-2xl bg-white">
                {/* cover picture */}
                <div className="h-[300px] w-full rounded-xl overflow-hidden">
                    {user?.coverPhoto ? (
                        <img src={user?.coverPhoto} className=" w-full h-full object-cover" />
                    ) : (
                        <div className="bg-gray-200 w-full h-full"></div>
                    )}
                </div>
                {isAuthenticated && user && authUserInfo?.username !== username && (
                    <div className="absolute space-x-1 right-7 top-[44%]">
                        <FollowButton currentUserId={authUserInfo?._id || ""} targetUserId={user?._id} initialIsFollowing={isFollowing} />
                        <Link to={`/messages/${user._id}`}>
                            <Button size={"sm"}>
                                <MessageSquare /> Message
                            </Button>
                        </Link>
                    </div>
                )}
                {/* <img src="https://placehold.co/1920x400" className="rounded-t-2xl" /> */}
                <div className="shadow-xl flex flex-col bg-white !rounded-b-3xl rounded-t-[100px] pt-2 px-2 pb-5 -translate-y-40 max-w-[220px] absolute left-10">
                    <Avatar className="size-48 border border-border">
                        <AvatarImage src={user.profilePicture} className="object-cover"/>
                        <AvatarFallback className="bg-teal-100 text-primary">{user.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-col justify-items-center">
                        <p className="font-bold text-2xl my-1 justify-center truncate max-w-44 pt-2 text-center text-primary" title={user.fullName}>{user.fullName}</p>
                        <div className="space-y-2">
                            {user.role === "TOUR_GUIDE" && (
                                <div className="flex items-center justify-center">
                                    <Star className="w-4 h-4 mx-1 stroke-amber-400 fill-amber-400" />
                                    <span className="font-medium text-black text-sm">{user.rating > 0 && user.rating} {generateRatingText(user.rating)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-center">
                                <UserRound className="w-4 h-4 mx-1 stroke-slate-600" />
                                <p className="font-medium text-slate-600 text-sm">{user.followers.length} Follower</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <UserRoundCheck className="w-4 h-4 mx-1 stroke-slate-600" />
                                <p className="font-medium text-slate-600 text-sm">{user.followings.length} Following</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-start px-6 py-10 bg-white">
                    <div className="flex-col justify-items-start content-center">
                        <div className="flex items-center py-2 gap-2">
                            <Mail className="w-4 h-4 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm leading-none">{user.email}</p>
                        </div>
                        {user?.phoneNumber && (
                            <div className="flex items-center py-2 gap-2">
                                <Phone className="w-4 h-4 stroke-slate-600" />
                                <p className="font-medium text-slate-600 text-sm leading-none">{user.phoneNumber}</p>
                            </div>
                        )}
                        {user?.dateOfBirth && (
                            <div className="flex items-center py-2 gap-2">
                                <Cake className="w-4 h-4 stroke-slate-600" />
                                <p className="font-medium text-slate-600 text-sm leading-none">{format(user?.dateOfBirth, "dd/MM/yyyy")}</p>
                            </div>
                        )}
                        {user?.address && (
                            <div className="flex items-center py-2 gap-2">
                                <MapPin className="w-4 h-4 stroke-slate-600" />
                                <p className="font-medium text-slate-600 text-sm leading-none">From {user.address || "N/A"}</p>
                            </div>
                        )}
                    </div>
                    <div className="my-2 mx-14 h-36 flex flex-col justify-items-start gap-2">
                        <p className="font-medium text-primary text-sm">Bio</p>
                        <textarea
                            name="bio"
                            value={user.bio || "No bio available yet."}
                            readOnly
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
                        {user?.role === "TOUR_GUIDE" && (
                            <>
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
                            </>
                        )}
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
                        dateOfBirth: new Date(user.dateOfBirth),
                        introduction: user.bio || "",
                        avatar: user.profilePicture || "",
                        coverPhoto: user.coverPhoto || "",
                    }}
                />
            )}
            
            <div className="mb-5">
                <Outlet context={{ userId: user?._id, role: user?.role, followers: user?.followers, followings: user?.followings }} />
            </div>
        </div>
    );
};

export default ProfileLayout;