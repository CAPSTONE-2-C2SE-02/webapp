import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "./message-api";
import { Conversation, Message } from "@/lib/types";
import useAuthInfo from "@/hooks/useAuth";

export function useSendMessageMutation(recipientId: string) {
  const queryClient = useQueryClient();
  const auth = useAuthInfo();

  return useMutation({
    mutationFn: async ({ content, tourId, images }: { content?: string, tourId?: string; images?: File[] }) => {
      if (!recipientId) throw new Error("Recipient ID is required");
      const res = await sendMessage({ recipient: recipientId, content, tour: tourId, images });
      if (!res.result) throw new Error("Failed to send message");
      return res.result as Message;
    },
    onSuccess: (message: Message) => {
      queryClient.setQueryData<Message[]>(
        ["messages", message.recipient._id, message.sender._id],
        (oldMessages = []) => [...oldMessages, message]
      )

      queryClient.setQueryData<Conversation[]>(
        ["conversations", auth?._id],
        (oldConversations = []) => {
          const exists = oldConversations.some((conv) =>
            conv.participants.some((p) => p._id === recipientId)
          );
          if (exists) {
            return oldConversations.map((conv) =>
              conv.participants.some((p) => p._id === recipientId)
              ? {
                ...conv,
                lastMessage: message,
              }
              : conv
            )
          }
          return [
            {
              _id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
              participants: [message.recipient],
              messages: [message],
              lastMessage: message,
              updatedAt: message.updatedAt,
              createdAt: `${Date.now()}`,
            },
            ...oldConversations,
          ];
        }
      );
    }
  })
}