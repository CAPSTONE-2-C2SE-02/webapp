import PostCard from "@/components/post/post-card";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import { Post } from "@/lib/types";
import emptyArt from "@/assets/empty-art.svg";

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
        An error occurred while loading.
      </p>
    )
  }

  if (status === "success" && !data?.length) {
    return (
      <div className="text-center text-muted-foreground">
        <img src={emptyArt} alt="empty" className="w-40 h-40 mx-auto" />
        <span className="text-base">No posts found.</span>
      </div>
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