import { Notification } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Link } from "react-router";
import { format, formatDistanceToNow } from "date-fns";
import NotificationContent from "./notification-content";
import useAuthInfo from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const auth = useAuthInfo();

  const getRelatedLink = (notification: Notification) => {
    switch (notification.type) {
      case "BOOKING":
        return `tours/${notification.relatedId._id}`
      case "FOLLOW":
        return `${notification.relatedId.username}`
      case "COMMENT":
      case "LIKE":
        return `${auth?.username}/post/${notification.relatedId._id}`
      default:
        return ""
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  };

  return (
    <Link to={`/${getRelatedLink(notification)}`} onClick={onMarkAsRead} className="block py-1">
      <div className={cn(
        "flex items-start gap-3 py-2 pl-4 pr-2 relative rounded-md hover:bg-slate-50 cursor-pointer group",
        notification.isRead ? "opacity-80 bg-white" : "opacity-100"
      )}>
        <Avatar className="h-8 w-8 border border-muted">
          <AvatarImage src={notification.senderId.profilePicture} alt="avatar user" />
          <AvatarFallback>Username</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <NotificationContent notification={notification} />
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {format(new Date(notification.createdAt), 'EEEE h:mm a')}
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
          {!notification.isRead && <div className="absolute top-0 left-2 w-2 h-2 rounded-full bg-emerald-500" />}
          <Button
            variant={"outline"}
            size={"icon"}
            className="absolute h-7 w-7 hidden group-hover:inline-flex [&_svg]:size-4 right-2 top-0"
            onClick={handleDeleteNotification}
          >
            <Trash2 className="size-3 text-red-400" />
          </Button>
        </div>
      </div>
    </Link>
  )
}

export default NotificationCard