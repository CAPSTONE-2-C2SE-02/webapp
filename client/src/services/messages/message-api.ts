import axiosInstance from "@/config/api";
import { ApiResponse, Conversation, Message } from "@/lib/types";

export const sendMessage = async ({ recipient, content, tour }: { recipient: string; content?: string, tour?: string }): Promise<ApiResponse<Message>> => {
  const response = await axiosInstance.post("/messages", { recipient, content, tour });
  return response.data;
};

export const getMessages = async (userId: string): Promise<Message[]> => {
  const response = await axiosInstance.get(`/messages/${userId}`);
  return response.data.result;
};

export const getConversationsSidebar = async (): Promise<Conversation[]> => {
  const response = await axiosInstance.get("/messages/conversations/sidebar");
  return response.data.result;
};