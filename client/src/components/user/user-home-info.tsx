import { useAppSelector } from "@/hooks/redux";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const UserHomeInfo = () => {
  const user = useAppSelector(state => state.auth.userInfo);
  return (
    <Link to={`/${user?.username}`}>
      <div className="w-full bg-white p-3 rounded-2xl border border-border">
        <div className="flex flex-col items-center mb-5">
          <Avatar className="size-14 border mb-1">
            <AvatarImage src={user?.profilePicture} className="object-cover" />
            <AvatarFallback className="bg-teal-100 text-primary">{user?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <h5 className="text-lg font-semibold text-primary">{user?.fullName}</h5>
          <span className="text-xs text-zinc-400">@{user?.username}</span>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-lg flex items-center justify-center gap-5">
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-primary">{user?.countPosts}</span>
            <span className="text-xs font-medium text-zinc-400">Articles</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-primary">{user?.followings?.length}</span>
            <span className="text-xs font-medium text-zinc-400">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-primary">{user?.followers?.length}</span>
            <span className="text-xs font-medium text-zinc-400">Followers</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserHomeInfo;
