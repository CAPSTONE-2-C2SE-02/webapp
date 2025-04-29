import axiosInstance from "@/config/api";
import { ApiResponse, Conversation, ConversationMedia, Message } from "@/lib/types";

export const sendMessage = async (opts: {
  recipient: string;
  content?: string;
  tour?: string;
  images?: File[];
}): Promise<ApiResponse<Message>> => {
  const fd = new FormData();
  fd.append("recipient", opts.recipient);
  if (opts.content) fd.append("content", opts.content);
  if (opts.tour) fd.append("tour", opts.tour);
  opts.images?.forEach(file => fd.append("images", file));
  const response = await axiosInstance.post("/messages", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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

export const getConversationMedia = async (userId: string): Promise<ConversationMedia> => {
  const response = await axiosInstance.get(`/messages/${userId}/media`);
  return response.data.result;
}