import { InfiniteData, QueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewPost, deletePost } from "./post-api";
import { PostsNewFeed } from "@/lib/types";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router";

// create post mutation
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNewPost,
    onSuccess: async (newPost) => {
      const queryFilter = { queryKey: ["posts-feed"] } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsNewFeed, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData?.pageParams,
              pages: [
                {
                  data: [newPost, ...firstPage.data],
                  nextPage: firstPage.nextPage,
                },
                ...oldData.pages.slice(1),
              ],
            }
          }
        },
      );

      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create post. Please try again.");
    }
  });

  return mutation;
};

// delete post mutation
export function useDeletePostMutation() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter = { queryKey: ["posts-feed"] } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsNewFeed, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.filter((p) => p._id !== deletedPost._id),
            })),
          };
        },
      );

      toast.success("Post deleted successfully");

      if (location.pathname.endsWith(`/post/${deletedPost._id}`)) {
        navigate('/');
      }
      
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete post. Please try again.");
    }
  });

  return mutation;
};