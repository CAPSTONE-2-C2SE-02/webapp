import { ApiResponse } from "@/lib/types";
import { rootApi } from "./root-api";

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