import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Link } from "react-router";

interface HoverUserCardProps {
  user: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
    bio: string;
  }
}

const HoverUserCard = ({ user }: HoverUserCardProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={`/${user.username}`} className="font-medium text-primary text-sm hover:underline">{user.fullName}</Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar className="border">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold text-primary">@{user.username}</h4>
            <h5 className="text-xs font-medium">{user.fullName}</h5>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.bio || "No bio yet."}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default HoverUserCard