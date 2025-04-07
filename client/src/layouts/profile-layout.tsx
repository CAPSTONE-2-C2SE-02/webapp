import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink, Outlet, useNavigate, useParams } from "react-router";
import { Cake, MessageSquare, UserRound } from "lucide-react"
import { Star } from "lucide-react"
import { UserRoundCheck } from "lucide-react"
import { Mail } from "lucide-react";
import { Phone } from "lucide-react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { getUserByUsername } from "@/services/user-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import FollowButton from "@/components/user/follow-button";
import { useQuery } from "@tanstack/react-query";

const ProfileLayout = () => {
    const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();

    // get username from url
    const { username } = useParams<{ username: string }>();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["user-profile", username],
        queryFn: () => getUserByUsername(username!)
    });

    useEffect(() => {
        if (isError) {
            navigate("/not-found", { replace: true });
        }
    }, [isError, navigate]);

    if (isLoading) {
        return (
            <div className="w-full">
                <Skeleton className="w-full" />
            </div>
        )
    }

    const isFollowing = user?.followers.map(item => item._id)?.includes(userInfo?._id ?? "") as boolean;

    return (
        <div className="w-full flex flex-col gap-5">
            <div className="relative w-full mt-8 px-2 pt-2 rounded-2xl bg-white">
                {/* cover picture */}
                <div className="h-[300px] w-full rounded-xl overflow-hidden">
                    {user?.coverPhoto ? (
                        <img src={user?.coverPhoto} className=" w-full h-full object-cover" />
                    ) : (                        
                        <div className="bg-gray-200 w-full h-full"></div>
                    )}
                </div>
                {isAuthenticated && user && userInfo?.username !== username && (
                    <div className="absolute space-x-1 right-7 top-[44%]">
                        <FollowButton currentUserId={userInfo?._id || ""} targetUserId={user?._id} initialIsFollowing={isFollowing}/>
                        <Button size={"sm"}>
                            <MessageSquare /> Message
                        </Button>
                    </div>
                )}
                {/* avatar*/}
                <div className="shadow-xl flex flex-col bg-white !rounded-b-xl rounded-t-[100px] [16px] pt-2 px-2 pb-3 -translate-y-40 max-w-[220px] absolute left-10">
                    <Avatar className="size-48 border border-border">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback>{user?.fullName}</AvatarFallback>
                    </Avatar>
                    <div className="flex-col justify-items-center">
                        <p className="font-bold text-2xl my-1 justify-center truncate max-w-44 pt-2">{user?.fullName}</p>
                        {user?.role === "TOUR_GUIDE" && (
                            <div className="flex items-center py-2">
                                <Star className="w-4 h-4 mx-1 stroke-amber-400" />
                                <p className="font-medium text-black text-sm">4.8 Excellent</p>
                            </div>
                        )}
                        <div className="flex items-center py-2">
                            <UserRound className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">{user?.followers.length} Follower</p>
                        </div>
                        <div className="flex items-center py-2">
                            <UserRoundCheck className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">{user?.followings.length} Following</p>
                        </div>
                    </div>
                </div>
                {/* user infomation */}
                <div className="flex justify-end items-start px-6 py-10 bg-white ">
                    <div className="flex-col justify-items-start content-center">
                        <div className="flex items-center py-2 ">
                            <Mail className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600">{user?.email}</p>
                        </div>
                        <div className="flex items-center py-2">
                            <Phone className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm">{user?.phoneNumber}</p>
                        </div>
                        <div className="flex items-center py-2">
                            <MapPin className="w-4 h-4 mx-1 stroke-slate-600 " />
                            <p className="font-medium text-slate-600 text-sm">From {user?.address}</p>
                        </div>
                        <div className="flex items-center py-2">
                            <Cake className="w-4 h-4 mx-1 stroke-slate-600 " />
                            <p className="font-medium text-slate-600 text-sm">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-GB") : "N/A"}</p>
                        </div>
                    </div>
                    <div className="my-2 mx-14 h-36 flex flex-col justify-items-start gap-2">
                        <p className="font-medium text-slate-600 text-sm">Introduction</p>
                        <textarea name="bio" value={user?.bio} id="" disabled className="w-[630px] h-[94px] text-sm resize-none py-2 px-3 bg-slate-200 rounded-b-xl rounded-r-xl"></textarea>
                        {isAuthenticated && userInfo?.username === username && (
                            <Button className="ml-auto flex-shrink-0" size={"sm"}>
                                <Edit /> Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex justify-between border-t px-8 py-1 border-slate-200  rounded-b-2xl bg-white">
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
            <Outlet context={{ followers: user?.followers, followings: user?.followings }} />
        </div>
    )
}

export default ProfileLayout