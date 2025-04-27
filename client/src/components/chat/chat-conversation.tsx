import { useAppDispatch } from "@/hooks/redux";
import { LastMessage, MessageUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { setUserSelected } from "@/stores/slices/chat-slice";
import { formatDistanceToNow } from "date-fns";
import { NavLink } from "react-router";

interface ChatConversationProps {
  className?: string;
  userSender: MessageUser;
  lastMessage: LastMessage;
}

const ChatConversation = ({
  className,
  userSender,
  lastMessage,
}: ChatConversationProps) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(setUserSelected(userSender));
  };

  return (
    <NavLink
      to={`/messages/${userSender._id}`}
      onClick={handleClick}
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
              {formatDistanceToNow(new Date(lastMessage?.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm line-clamp-1 text-slate-600">
            {lastMessage.content}
          </p>
        </div>
      </div>
    </NavLink>
  );
};

export default ChatConversation;
