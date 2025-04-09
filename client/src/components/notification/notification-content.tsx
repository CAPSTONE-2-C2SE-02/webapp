import { Notification } from "@/lib/types"

const NotificationContent = ({ notification }: { notification: Notification }) => {
  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case "FOLLOW":
        return "followed you"
      case "LIKE":
        return `liked to your post ${notification?.relatedId?.content[0] ? `"${notification?.relatedId?.content[0]}"` : ""}`
      case "BOOKING":
        return `booked a tour"`
      case "COMMENT":
        return `commented on your post ${notification?.relatedId?.content[0] ? `"${notification?.relatedId?.content[0]}"` : ""}`
      default:
        return ""
    }
  };
  return (
    <>
      <div className="text-[13px] line-clamp-2">
        <span className="font-semibold text-primary">{notification.senderId.fullName}</span>{" "}
        <span className="text-slate-500">{getNotificationContent(notification)}</span>
      </div>
      {notification.message && (notification.type === "BOOKING") && (
        <div className="my-2 text-xs text-gray-700 line-clamp-1 border-l rounded-sm py-2 border-primary pl-2 bg-gradient-to-r from-slate-200 to-transparent">
          {'title' in notification.relatedId ? notification.relatedId.title : ''}
        </div>
      )}
    </>
  )
}

export default NotificationContent