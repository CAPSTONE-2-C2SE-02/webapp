import { Notification } from "@/lib/types"

const NotificationContent = ({ notification }: { notification: Notification }) => {
  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case "FOLLOW":
        return "followed you"
      case "LIKE":
        return `liked to your post ${notification?.relatedId?.content[0] ? `"${notification?.relatedId?.content[0]}"` : ""}`
      case "BOOKING":
        if (!notification.senderId) {
          return null
        }
        return 'has just booked your tour'
      case "COMMENT":
        return `commented on your post ${notification?.relatedId?.content[0] ? `"${notification?.relatedId?.content[0]}"` : ""}`
      case "CONFIRM":
      case "REVIEW":
        return notification.message;
      case "WARNING":
        return notification.message || "You have a new warning";
      default:
        return null;
    }
  };
  return (
    <>
      <div className="text-[13px] line-clamp-2">
        <span className="font-semibold text-primary">{notification?.senderId?.fullName || "TripConnect"}</span>{" "}
        <span className="text-slate-500">{getNotificationContent(notification)}</span>
      </div>
      {notification.message && (notification.type === "BOOKING") && (
        <div className="my-2 text-xs text-gray-700 border-l rounded-sm py-2 border-primary pl-2 bg-gradient-to-r from-slate-200 to-transparent">
          {!notification.senderId ? (
            <span className="line-clamp-2" title={notification.message}>{notification.message}</span>
          ) : (
            <span className="line-clamp-2">{'title' in notification.relatedId ? notification.relatedId.title : ''}</span>
          )}
        </div>
      )}
    </>
  )
}

export default NotificationContent