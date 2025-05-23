import { UserInfo } from "@/lib/types";
import { Avatar, AvatarImage } from "../ui/avatar";
import FollowButton from "./follow-button";
import { useAppSelector } from "@/hooks/redux";
import { Link } from "react-router";

interface UserCardProps {
  user: UserInfo;
}

const UserCard = ({ user }: UserCardProps) => {
  const { userInfo, isAuthenticated } = useAppSelector((state) => state.auth);
  const isFollowing = userInfo?.followings.map(item => item._id).includes(user?._id) as boolean;
  return (
    <div className="bg-white border border-border rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.profilePicture} />
          </Avatar>
          <div className="flex flex-col gap-1">
            <Link to={`/${user.username}`} className="text-sm font-bold text-primary hover:underline">{user.fullName}</Link>
            <p className="text-sm text-muted-foreground leading-none">@{user.username}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{user.bio ? user.bio : "No bio"}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {user.followers.length} followers
              </p>
              <p className="text-xs text-muted-foreground">
                {user.followings.length} following
              </p>
            </div>
          </div>
        </div>
        {isAuthenticated && user._id !== userInfo?._id && (
          <FollowButton currentUserId={userInfo?._id || ""} targetUserId={user._id} initialIsFollowing={isFollowing} />
        )}
      </div>
    </div>
  )
}

export default UserCard