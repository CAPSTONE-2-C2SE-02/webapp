import { ApiResponse, Post, PostsNewFeed } from "@/lib/types";
import axios from "axios";
import axiosInstance from "@/config/api";

const BASE_URL = import.meta.env.VITE_API_URL;

export const createNewPost = async (formData: FormData): Promise<Post> => {
  const response = await axiosInstance.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data.result;
};

export const fetchPostDetail = async (postId: string): Promise<ApiResponse<Post>> => {
  const response = await axios.get(`${BASE_URL}/posts/${postId}`);
  return response.data;
};

export const fetchPostByUsername = async ({ username, pageParam = 1 }: { username: string; pageParam: number }): Promise<PostsNewFeed> => {
  const response = await axios.get(`${BASE_URL}/posts/profile/${username}?page=${pageParam}&limit=4`);
  return response.data.result;
};

export const fetchNewsFeed = async ({ pageParam = 1 }: { pageParam: number }): Promise<PostsNewFeed> => {
  const response = await axios.get(`${BASE_URL}/posts?page=${pageParam}&limit=4`);
  return response.data.result;
};

export const deletePost = async (postId: string): Promise<Post> => {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data.result;
};