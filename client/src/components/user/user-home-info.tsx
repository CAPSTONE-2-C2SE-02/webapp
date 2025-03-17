import userAvatar from "@/assets/avatar-demo.jpg";

const UserHomeInfo = () => {
  const userInfo = {
    fullName: "Ngoc Duc",
    username: "ngocduc812",
    avatar: userAvatar,
    posts: 24,
    tours: 20,
    followers: 12,
  }
  return (
    <div className="w-full bg-white p-3 rounded-2xl border border-border">
      <div className="flex flex-col items-center mb-5">
        <img src={userInfo.avatar} alt="avatar" className="size-[60px] object-cover rounded-full" />
        <span className="text-lg font-semibold text-primary">{userInfo.fullName}</span>
        <span className="text-xs text-zinc-400">@{userInfo.username}</span>
      </div>
      <div className="px-4 py-2 bg-slate-100 rounded-lg flex items-center justify-center gap-5">
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-primary">{userInfo.posts}</span>
          <span className="text-xs font-medium text-zinc-400">Articles</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-primary">{userInfo.tours}</span>
          <span className="text-xs font-medium text-zinc-400">Tours</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-primary">{userInfo.followers}</span>
          <span className="text-xs font-medium text-zinc-400">Followers</span>
        </div>
      </div>
    </div>
  );
};

export default UserHomeInfo;
