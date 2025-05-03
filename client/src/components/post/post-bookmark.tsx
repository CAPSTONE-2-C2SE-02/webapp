import PostCard from "@/components/post/post-card";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import { Post } from "@/lib/types";

interface PostBookmarkProps {
  data: Post[] | undefined;
  status: "error" | "success" | "pending";
}

const PostBookmark = ({ data, status }: PostBookmarkProps) => {
  if (status === "pending") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive text-sm">
        An error occurred while loading bookmarks.
      </p>
    )
  }

  if (status === "success" && !data?.length) {
    return (
      <p className="text-center text-muted-foreground text-sm">
        You don&apos;t have any bookmarks yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {data?.map((post) => (
        <PostCard key={post._id} postData={post} />
      ))}
    </div>
  )
}

export default PostBookmark