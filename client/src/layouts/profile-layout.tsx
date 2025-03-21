import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink, Outlet, useParams } from "react-router";
import { UserRound } from "lucide-react"
import { Star } from "lucide-react"
import { UserRoundCheck } from "lucide-react"
import { Mail } from "lucide-react";
import { Phone } from "lucide-react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";

const ProfileLayout = () => {
    const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);

    // get username from url
    const { username } = useParams();

    return (
        <div className="w-full flex flex-col gap-5">
            <div className="relative w-full py-8">
                <img src="https://placehold.co/1920x400" className="rounded-t-2xl" />
                <div className="shadow-xl flex flex-col bg-white !rounded-b-xl rounded-t-[100px] [16px] pt-2 px-2 pb-3 -translate-y-40 max-w-[220px] absolute left-10">
                    <Avatar className="size-48 border border-border">
                        <AvatarImage />
                        <AvatarFallback>Ngoc Anh</AvatarFallback>
                    </Avatar>
                    <div className="flex-col justify-items-center">
                        <p className="font-bold text-2xl my-1 justify-center truncate max-w-44 pt-2">Ngọc Ánh</p>
                        <div className="flex items-center py-2">
                            <Star className="w-4 h-4 mx-1 stroke-amber-400" />
                            <p className="font-medium text-black text-sm"> 4.8 Excellent</p>
                        </div>
                        <div className="flex items-center py-2">
                            <UserRound className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm"> 812 Follower</p>
                        </div>
                        <div className="flex items-center py-2">
                            <UserRoundCheck className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm"> 812 Following</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-start px-6 py-10 bg-white ">
                    <div className="flex-col justify-items-start content-center">
                        <div className="flex items-center py-2 ">
                            <Mail className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600"> ptnanh125@gmail.com</p>
                        </div>
                        <div className="flex items-center py-2">
                            <Phone className="w-4 h-4 mx-1 stroke-slate-600" />
                            <p className="font-medium text-slate-600 text-sm"> 0935112120</p>
                        </div>
                        <div className="flex items-center py-2">
                            <MapPin className="w-4 h-4 mx-1 stroke-slate-600 " />
                            <p className="font-medium text-slate-600 text-sm"> From Dong Ha</p>
                        </div>
                        <a href="" className="mx-1 text-blue-900 font-medium underline py-2 text-sm">More</a>
                    </div>
                    <div className="my-2 mx-14 h-36 flex flex-col justify-items-start gap-2">
                        <p className="font-medium text-slate-600 text-sm">Introduction</p>
                        <textarea name="intro" value="asdasdasd" id="" disabled className="w-[630px] h-[94px] p-2 bg-blue-200 rounded-b-xl rounded-r-xl"></textarea>
                        {isAuthenticated && userInfo?.username === username && (
                            <Button variant={"outline"} className="bg-blue-950 text-white !h-[34px] w-fit ml-auto">
                                <Edit /> Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex justify-between border-t px-8 py-1 border-slate-200  rounded-b-2xl bg-white">
                    <div className="flex items-center">
                        <NavLink
                            to={`/users/userId`}
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
                            to={`/users/userId/follow`}
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
                            to={`/users/userId/images`}
                            className={({ isActive }) =>
                                cn(
                                    "bg-white px-4 py-2 font-medium text-sm",
                                    isActive ? "border-b-2 border-primary" : "text-muted-foreground"
                                )
                            }
                        >
                            Images
                        </NavLink>
                        <NavLink
                            to={`/users/userId/tours`}
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
                            to={`/users/userId/reviews`}
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
            <Outlet />
        </div>

    )
}

export default ProfileLayout