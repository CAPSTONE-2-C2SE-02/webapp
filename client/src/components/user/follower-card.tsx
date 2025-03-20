import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserCheck } from "lucide-react"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface FollowerCardProps {
  data: {
    name: string,
    role: string;
    isFollow: boolean;
    avatar: string;
    followers: number;
  }
}

const FollowerCard = ({data}:FollowerCardProps ) => {
  const [isFollowing, setIsFollowing] = useState(data.isFollow)

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }
  return (
    <div className="p-3 border border-border rounded-xl w-[290px]">
      <div className="flex justify-between items-center gap-3">
        <div className='flex w-full'>
          <div className="flex-shrink-0">
            <Avatar className="size-14 border border-border">
              <AvatarImage />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-4 flex-1 ">
            <p className="text-base font-bold">{data.name}</p>
            <p className="text-gray-600 text-xs">{data.followers} {data.followers > 1 ? "Followers" : "Follower"}</p>
          </div>
        </div>
        <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">{data.role}</Badge>
      </div>
      <div className="mt-4 flex justify-end ">
        <Button
          onClick={toggleFollow}
          variant={isFollowing ? "outline" : "default"}
          className={`
                ${isFollowing ? "text-primary text-sm border-primary hover:text-primary hover:bg-teal-50" : "bg-primary hover:bg-primary"}
              `}
        >
          {isFollowing ? (
            <>
              <UserCheck className="mr-2 " />
              Following
            </>
          ) : (
            <>
              <UserPlus className="mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>
    </div>

  )
}

export default FollowerCard