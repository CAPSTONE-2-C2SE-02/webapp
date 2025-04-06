import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import FollowButton from "./follow-button";
import { useAppSelector } from "@/hooks/redux";
import { Follow } from "@/lib/types";
import { convertRoleName } from "../utils/convert";
import { Link } from "react-router";

interface FollowerCardProps {
  user: Follow;
}

const FollowerCard = ({ user }: FollowerCardProps) => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const followerCount = Array.isArray(user.followers) ? user.followers.length : 0;

  const isFollowing = userInfo?.followings.map(item => item._id).includes(user?._id) as boolean;

  return (
    <div className="p-3 border border-border rounded-xl w-full h-full">
      <div className="flex justify-between items-center gap-3">
        <div className='flex w-full items-center gap-4'>
          <div className="flex-shrink-0">
            <Avatar className="size-10 border border-border">
              <AvatarImage />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 ">
            <Link
                to={`/${user?.username}`}
                className="hover:underline text-sm font-medium"
              >
                {user?.fullName}
            </Link>
            <p className="text-gray-600 text-xs">{followerCount} {followerCount > 1 ? "Followers" : "Follower"}</p>
          </div>
        </div>
        <Badge className="rounded-full text-xs truncate min-w-fit capitalize text-primary" variant={"outline"}>{convertRoleName(user.role.name)}</Badge>
      </div>
      <div className="mt-2 flex justify-end ">
        {user._id !== userInfo?._id && <FollowButton currentUserId={userInfo?._id || ""} targetUserId={user._id} initialIsFollowing={isFollowing} />}
      </div>
    </div>
  )
}

export default FollowerCard