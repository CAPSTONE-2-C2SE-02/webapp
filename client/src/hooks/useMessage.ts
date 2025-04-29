import { getConversationsSidebar, getMessages } from "@/services/messages/message-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthInfo from "./useAuth";
import { useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import { Conversation, Message } from "@/lib/types";

export default function useMessage(userId?: string) {
  const queryClient = useQueryClient();
  const auth = useAuthInfo();
  const socket = useSocket();
  
  const { data: conversations } = useQuery({
    queryKey: ["conversations", auth?._id],
    queryFn: () => getConversationsSidebar(),
    enabled: !!auth?._id,
    refetchOnWindowFocus: false,
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["messages", userId, auth?._id],
    queryFn: () => getMessages(userId!),
    enabled: !!userId && conversations?.some((conv) => conv.participants[0]._id === userId),
  });

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message: Message) => {
      console.log("Received newMessage event:", message);
      queryClient.setQueryData<Message[]>(
        ["messages", message.sender._id, auth?._id],
        (oldData = []) => {
          const existingMessage = oldData.find((msg) => msg._id === message._id);
          if (!existingMessage) {
            return [...oldData, message];
          }
          return oldData;
        }
      );

      queryClient.setQueryData<Conversation[]>(["conversations", auth?._id], (oldConversations = []) => {
        return oldConversations.map((conversation) => {
          if (conversation.participants[0]._id === message.sender._id) {
            return {
              ...conversation,
              lastMessage: message,
            };
          }
          return conversation;
        })
      });
    }
    socket?.on("newMessage", handleNewMessage);

    return () => {
      socket?.off("newMessage", handleNewMessage);
    }
  }, [queryClient, socket, auth?._id, userId]);

  return {
    messages,
    isMessagesLoading,
    conversations,
  }
}