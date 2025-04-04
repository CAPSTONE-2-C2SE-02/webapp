import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import FollowButton from "./follow-button";
import { useAppSelector } from "@/hooks/redux";
import { UserInfo } from "@/lib/types";

interface FollowerCardProps {
  user: UserInfo;
}

const FollowerCard = ({ user }: FollowerCardProps ) => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const isFollowing = user?.followers?.includes(userInfo?._id ?? "") as boolean
  const followerCount = Array.isArray(user.followers) ? user.followers.length : 0
  return (
    <div className="p-3 border border-border rounded-xl w-[290px]">
      <div className="flex justify-between items-center gap-3">
        <div className='flex w-full'>
          <div className="flex-shrink-0">
            <Avatar className="size-14 border border-border">
              <AvatarImage />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-4 flex-1 ">
            <p className="text-base font-bold">{user.fullName}</p>
            <p className="text-gray-600 text-xs">{followerCount} {followerCount > 1 ? "Followers" : "Follower"}</p>
          </div>
        </div>
        <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">{user.role.name}</Badge>
      </div>
      <div className="mt-4 flex justify-end ">
        <FollowButton currentUserId={userInfo?._id || ""} targetUserId={user._id} initialIsFollowing={isFollowing}/>
      </div>
    </div>

  )
}

export default FollowerCard