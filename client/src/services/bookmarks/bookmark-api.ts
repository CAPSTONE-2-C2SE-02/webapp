import axiosInstance from "@/config/api";
import { ApiResponse, BookmarkInfo, Post, Tour } from "@/lib/types";

export type ItemType = "post" | "tour";

// Bookmark an item
export const bookmark = async (itemType: ItemType, itemId: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post(`/bookmarks/${itemType}/${itemId}`);
  return response.data;
};

// Unbookmark an item
export const unbookmark = async (itemType: ItemType, itemId: string): Promise<ApiResponse> => {
  const response = await axiosInstance.delete(`/bookmarks/${itemType}/${itemId}`);
  return response.data;
};

// Get bookmark item
export const getBookmark = async (itemType: ItemType, itemId: string): Promise<BookmarkInfo> => {
  const response = await axiosInstance.get(`/bookmarks/${itemType}/${itemId}`);
  return response.data.result;
};

// Get all bookmarks
export const getAllBookmarks = async (): Promise<{ posts: Post[]; tours: Tour[] }> => {
  const response = await axiosInstance.get("/bookmarks");
  return response.data.result;
};