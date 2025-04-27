import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";

interface MessageItemProps {
  message: Message;
  isFirstInGroup: boolean;
  currentUserId: string | undefined;
}

const MessageItem = ({
  message,
  isFirstInGroup,
  currentUserId,
}: MessageItemProps) => {
  const sender = message.sender;
  const isCurrentUser = message.sender._id === currentUserId;

  return (
    <div className={cn("flex gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && isFirstInGroup && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender?.profilePicture} alt={sender?.fullName} className="object-cover" />
          <AvatarFallback>{sender?.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      {!isCurrentUser && !isFirstInGroup && <div className="w-8" />}

      <div className={cn("max-w-[60%] flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
        {isFirstInGroup && (
          <div className={cn("mb-1 text-xs", isCurrentUser ? "text-right" : "text-left")}>
            <span className="text-muted-foreground">{format(new Date(message.createdAt), 'h:mm a')}</span>
          </div>
        )}
        <div
          className={cn(
            "rounded-xl px-4 py-2 text-sm",
            isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
