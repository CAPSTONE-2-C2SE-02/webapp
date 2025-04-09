import { Bell, CheckCheck } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { ScrollArea } from "../ui/scroll-area"
import NotificationCard from "./notification-card"
import { useMemo, useState } from "react"
import useNotifications from "@/hooks/useNotifications"

const NotificationSheet = () => {
  const [isShowSheet, setIsShowSheet] = useState(false);

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleMakeAsRead = (id: string) => {
    markAsRead(id);
    setIsShowSheet(false);
  };

  const unreadCount = useMemo(
    () => notifications?.filter((n) => !n.isRead).length,
    [notifications]
  ) as number;

  return (
    <Sheet open={isShowSheet} onOpenChange={setIsShowSheet}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl size-10 relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute px-1.5 -top-0.5 -right-2 text-[10px] font-medium text-white bg-red-400 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0">
        <SheetHeader className="py-4 px-6 border-b">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-primary">Notification</SheetTitle>
            <SheetDescription className="sr-only">Notification</SheetDescription>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-132px)]">
            <div className="divide-y px-5 flex flex-col">
              {notifications ? (
                notifications.map((notification) => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={() => handleMakeAsRead(notification._id)}
                    onDelete={() => deleteNotification(notification._id)}
                  />
                ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No notifications.
                  </div>
                )
              }
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="sm:justify-between py-3 px-6">
          <Button
            variant="outline"
            size="sm"
            className="text-primary"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
            <span>Make all as read</span>
          </Button>
          <Button variant="default" size="sm">
            View all
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default NotificationSheet;