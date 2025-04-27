import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "./message-api";
import { Conversation, Message } from "@/lib/types";
import useAuthInfo from "@/hooks/useAuth";

export function useSendMessageMutation(recipientId: string) {
  const queryClient = useQueryClient();
  const auth = useAuthInfo();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!recipientId) throw new Error("Recipient ID is required");
      const res = await sendMessage({ recipient: recipientId, content });
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
        (oldConversations = []) =>
          oldConversations.map((conv) =>
            conv.participants.some((p) => p._id === recipientId)
              ? {
                  ...conv,
                  lastMessage: {
                    _id: message._id,
                    content: message.content,
                    updatedAt: message.updatedAt,
                  },
                }
              : conv
          )
      );
    }
  })
}