import axiosInstance from "@/config/api";
import { Comment } from "@/lib/types";
import axios from "axios";

export const createComment = async (postId: string, content: string, parentId?: string): Promise<Comment> => {
  const response = await axiosInstance.post("/comments", {
    postId,
    content,
    parentComment: parentId,
  });
  if (!response.status) {
    throw new Error("Failed to create comment");
  }
  return response.data.result;
};

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/comments/${postId}`);
  if (!response.status) {
    throw new Error("Failed to fetch comments");
  }
  return response.data.result;
};