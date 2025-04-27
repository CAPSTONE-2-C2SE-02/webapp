import useAuthInfo from "@/hooks/useAuth"
import MessageItem from "./message-item";
import { Message } from "@/lib/types";

interface MessageGroupProps {
  messages: Message[] | undefined;
}

const MessageGroup = ({ messages }: MessageGroupProps) => {
  const auth = useAuthInfo();

  const groupedMessages: Message[][] = []
  let currentGroup: Message[] = []

  messages?.forEach((message, index) => {
    if (index === 0) {
      // First message starts a new group
      currentGroup = [message]
    } else {
      const prevMessage = messages[index - 1]
      if (prevMessage.sender._id === message.sender._id) {
        // Same sender, add to current group
        currentGroup.push(message)
      } else {
        // Different sender, start a new group
        groupedMessages.push([...currentGroup])
        currentGroup = [message]
      }
    }
  })

  // Add the last group if it's not empty
  if (currentGroup.length > 0) {
    groupedMessages.push(currentGroup)
  }

  return (
    <div className="space-y-4">
      {groupedMessages.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-1">
          {group.map((message, messageIndex) => (
            <MessageItem
              key={message._id}
              message={message}
              currentUserId={auth?._id}
              isFirstInGroup={messageIndex === 0}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default MessageGroup