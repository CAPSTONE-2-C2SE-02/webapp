import { Notification } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "follow":
        return "followed you"
      case "like":
        return `liked the post "${notification.postTitle}"`
      case "share":
        return `shared the post "${notification.postTitle}"`
      case "book":
        return "booked a tour"
      case "reply":
        return `reply you in a comment on "${notification.postTitle}"`
      default:
        return ""
    }
  }

  return (
    <div className="flex items-start gap-3 py-3.5 px-2 relative hover:bg-slate-50 cursor-pointer">
      <Avatar className="h-8 w-8 border border-muted">
        <AvatarImage src="https://images.unsplash.com/profile-1441298803695-accd94000cac?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=64&w=64&s=5a9dc749c43ce5bd60870b129a40902f" alt="avatar user" />
        <AvatarFallback>Username</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-[13px]">
          <span className="font-semibold text-primary">{notification.user.name}</span>{" "}
          <span className="text-slate-500">{getNotificationText(notification)}</span>
        </div>
        {notification.content && (
          <div className="my-2 text-xs text-gray-700 line-clamp-1 border-l rounded-sm py-2 border-primary pl-2 bg-gradient-to-r from-slate-200 to-transparent">
            {notification.content}
          </div>
        )}
        {notification.extraInfo && (
          <div className="my-2 text-xs text-gray-700 bg-slate-200 p-2 rounded line-clamp-1">{notification.extraInfo}</div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">{notification.timestamp}</div>
          <div className="text-xs text-gray-500 whitespace-nowrap">{notification.timeAgo}</div>
        </div>
        {!notification.read && <div className="absolute top-4 right-2 w-2 h-2 rounded-full bg-emerald-500" />}
      </div>
    </div>
  )
}

export default NotificationCard