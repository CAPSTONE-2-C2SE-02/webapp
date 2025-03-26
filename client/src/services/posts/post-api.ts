import { ApiResponse, Post, PostsNewFeed } from "@/lib/types";
import { rootApi } from "../root-api";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const postApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: "/posts",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useCreatePostMutation } = postApi;

export const fetchPostDetail = async (postId: string): Promise<ApiResponse<Post>> => {
  const response = await axios.get(`${BASE_URL}/posts/${postId}`);
  return response.data;
};

export const fetchPostByUsername = async ({ username, pageParam = 1 }: { username: string; pageParam: number }): Promise<PostsNewFeed> => {
  const response = await axios.get(`${BASE_URL}/posts/profile/${username}?page=${pageParam}&limit=2`);
  return response.data.result;
};

export const fetchNewsFeed = async ({ pageParam = 1 }: { pageParam: number }): Promise<PostsNewFeed> => {
  const response = await axios.get(`${BASE_URL}/posts?page=${pageParam}&limit=2`);
  return response.data.result;
};