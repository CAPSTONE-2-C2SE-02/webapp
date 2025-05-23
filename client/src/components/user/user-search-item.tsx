import { UserInfo } from "@/lib/types";
import { Link } from "react-router";
import { Avatar, AvatarImage } from "../ui/avatar";
interface UserSearchItemProps {
  user: UserInfo;
}

const UserSearchItem = ({ user }: UserSearchItemProps) => {
  return (
    <Link to={`/${user.username}`} prefetch="intent">
      <div className="bg-white hover:bg-gray-100 p-2 rounded-md flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarImage src={user.profilePicture} />
        </Avatar>
        <div className="flex flex-col items-start gap-0 flex-1">
          <h5 className="font-medium text-sm text-primary line-clamp-1">{user.fullName}</h5>
          <span className="font-normal text-xs text-gray-400">{user.username}</span>
        </div>
      </div>
    </Link>
  )
}

export default UserSearchItem