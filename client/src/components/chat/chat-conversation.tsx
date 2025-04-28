import { Conversation, MessageUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { NavLink } from "react-router";

interface ChatConversationProps {
  className?: string;
  userSender: MessageUser;
  conversation: Conversation;
}

const ChatConversation = ({
  className,
  userSender,
  conversation
}: ChatConversationProps) => {
  const renderLastMessage = () => {
    const lastMessage = conversation.lastMessage
    if (lastMessage.tour) {
      return `Sent a tour: ${lastMessage.tour.title}`;
    }
    if (lastMessage.content) {
      return lastMessage.content;
    }
    return lastMessage.imageUrls ? "Sent image" : "No messages yet";
  }
  return (
    <NavLink
      to={`/messages/${userSender._id}`}
      className={({ isActive }) =>
        cn(
          "w-full p-2 rounded-md hover:bg-accent",
          className,
          isActive ? "bg-accent" : "bg-white"
        )
      }
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
          <img
            src={userSender.profilePicture}
            alt={userSender.fullName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">
              {userSender.fullName.split(" ").slice(0, 2).join(" ")}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(conversation.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-xs line-clamp-1 text-slate-600">
            {renderLastMessage()}
          </p>
        </div>
      </div>
    </NavLink>
  );
};

export default ChatConversation;
