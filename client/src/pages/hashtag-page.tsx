import PostCard from "@/components/post/post-card";
import { getPostsByHashtag } from "@/services/posts/post-api"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react";
import { useParams } from "react-router"

const HashtagPage = () => {
  const { tag } = useParams() as { tag: string };

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["posts", tag],
    queryFn: () => getPostsByHashtag(tag!),
    select: data => data.result,
    staleTime: 1000 * 6 * 5,
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      {/* loading */}
      {isLoading && (
        <div className="bg-white w-full py-5 px-6 border border-border rounded-md mb-4">
          <p className="text-center flex items-center justify-center gap-2 font-medium text-primary">
            <Loader2 className="size-5 animate-spin" /> Loading post
          </p>
        </div>
      )}
      {/* error */}
      {isError && (
        <div className="bg-white w-full py-5 px-6 border border-border rounded-md mb-4 text-center text-red-500 font-medium">
          No posts found for this hashtag.
        </div>
      )}

      {posts && !isLoading && !isError && (
        <>
          <div className="bg-white w-full py-5 px-6 border border-border rounded-md mb-4">
            <h3 className="font-bold text-xl text-primary">#{tag}</h3>
            <span className="text-sm text-gray-500">{posts.length} {posts.length > 1 ? "posts" : "post"}</span>
          </div>
          {/* render posts list */}
          <div className="flex flex-col gap-3">
            {posts.map(post => (
              <PostCard postData={post} key={post._id} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default HashtagPage