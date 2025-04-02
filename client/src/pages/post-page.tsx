import PostCard from "@/components/post/post-card";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import { fetchPostDetail } from "@/services/posts/post-api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

const PostPage = () => {
  const { postId } = useParams();
  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPostDetail(postId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-[600px] mx-auto py-4">
        <PostCardSkeleton />
      </div>
    )
  }

  if (isError) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <div className="w-full max-w-[600px] mx-auto py-4">
      {post && <PostCard postData={post} />}
    </div>
  )
}

export default PostPage;