import { InfiniteData, QueryFilters, QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewPost, deletePost, likePost, updatePost } from "./post-api";
import { Post, PostsNewFeed } from "@/lib/types";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router";
import useAuthInfo from "@/hooks/useAuth";

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
      queryClient.invalidateQueries({ queryKey: ["rankings"] })
      queryClient.invalidateQueries({ queryKey: ["hashtags"] })
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

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete post. Please try again.");
    }
  });

  return mutation;
};

// update post mutation
export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, formData }: { postId: string; formData: FormData }) => updatePost(postId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update post. Please try again.");
    }
  });
}

// like post mutation
export function useLikePostMutation() {
  const queryClient = useQueryClient();
  const auth = useAuthInfo();

  const mutation = useMutation({
    mutationFn: likePost,

    onMutate: async (postId) => {
      const queryKey: QueryKey = ["post", postId];

      await Promise.all([
        queryClient.cancelQueries({ queryKey }),
        queryClient.cancelQueries({ queryKey: ["posts-feed"] }),
      ]);

      const previousPost = queryClient.getQueryData<Post>(queryKey);
      const previousPostsFeed = queryClient.getQueryData<InfiniteData<PostsNewFeed>>(["posts-feed"]);

      // optimistically update the individual post cache
      queryClient.setQueryData<Post>(queryKey, (oldPost) => {
        if (!oldPost || !auth) return oldPost;

        return {
          ...oldPost,
          likes: oldPost.likes.some((like) => like._id === auth._id)
            ? oldPost.likes.filter((like) => like._id !== auth._id)
            : [...oldPost.likes, { _id: auth._id, username: auth.username, fullName: auth.fullName }]
        };
      });

      // optimistically update the posts-feed cache
      queryClient.setQueryData<InfiniteData<PostsNewFeed>>(["posts-feed"], (oldData) => {
        if (!oldData || !auth) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    likes: post.likes.some((like) => like._id === auth._id)
                      ? post.likes.filter((like) => like._id !== auth._id)
                      : [...post.likes, { _id: auth._id, username: auth.username, fullName: auth.fullName }],
                  }
                : post
            ),
          })),
        };
      });

      return { previousPost, previousPostsFeed };
    },
    onError: (_error, _postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", _postId], context.previousPost);
      }
      if (context?.previousPostsFeed) {
        queryClient.setQueryData(["posts-feed"], context.previousPostsFeed);
      }

      console.log(_error.stack);

      toast.error("Failed to like/unlike post. Please try again.");
    },
    onSuccess: (response, postId) => {
      // toast.success(response.message);
      queryClient.setQueryData<Post>(["post", postId], (oldPost) => {
        if (!oldPost) return oldPost;
        return { ...oldPost, likes: response.result || [] };
      });

      queryClient.setQueryData<InfiniteData<PostsNewFeed>>(["posts-feed"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post._id === postId ? { ...post, likes: response.result || [] } : post
            ),
          })),
        };
      });
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
    },
  });

  return mutation;
}