import userAvatar from "@/assets/avatar-demo.jpg";
import { useAppSelector } from "@/hooks/redux";
import { Link } from "react-router";

const UserHomeInfo = () => {
  const user = useAppSelector(state => state.auth.userInfo);
  return (
    <Link to={`/${user?.username}`}>
      <div className="w-full bg-white p-3 rounded-2xl border border-border">
        <div className="flex flex-col items-center mb-5">
          <img src={user?.profilePicture || userAvatar} alt="avatar" className="size-[60px] object-cover rounded-full" />
          <span className="text-lg font-semibold text-primary">{user?.fullName}</span>
          <span className="text-xs text-zinc-400">@{user?.username}</span>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-lg flex items-center justify-center gap-5">
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-primary">10</span>
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
