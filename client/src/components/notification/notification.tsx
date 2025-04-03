import { Bell, CheckCheck } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { ScrollArea } from "../ui/scroll-area"
import NotificationCard from "./notification-card"
import { notifications } from "@/lib/mock-data"

const Notification = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl size-10 relative">
          <Bell className="size-5" />
          <span className="absolute px-1.5 -top-0.5 -right-2 text-[10px] font-medium text-white bg-red-400 rounded-full">5</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-2">
            <SheetTitle>Notification</SheetTitle>
            <span className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
              5
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-132px)]">
            <div className="divide-y px-6">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="sm:justify-between py-3 px-6">
          <Button
            variant="outline"
            size="sm"
            className="text-primary"
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

export default Notification