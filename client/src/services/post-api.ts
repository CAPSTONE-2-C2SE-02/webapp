import { ApiResponse, Post } from "@/lib/types";
import { rootApi } from "./root-api";

interface PostsNewFeed {
  data: Post[];
  totalPosts: number;
  totalPage: number;
  currentPage: number;
  limit: number;
}

export const postApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: "/posts",
        method: "POST",
        body: formData,
      }),
    }),
    getPostsByUsername: builder.query<ApiResponse<Post[]>, { username: string }>({
      query: ({ username }) => {
        return {
          url: `/posts/profile/${username}`,
        }
      }
    }),
    getNewFeeds: builder.query<ApiResponse<PostsNewFeed>, void>({
      query: () => '/posts'
    })
  }),
});

export const { useCreatePostMutation, useGetPostsByUsernameQuery, useGetNewFeedsQuery } = postApi;