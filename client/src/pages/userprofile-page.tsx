import InfiniteScrollContainer from "@/components/post/infinite-scroll-container";
import NewPost from "@/components/post/new-post";
import PostCard from "@/components/post/post-card";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import ToursRecommend from "@/components/tour/tours-recommend";
import { Calendar } from "@/components/ui/calendar"
import { useAppSelector } from "@/hooks/redux";
import { fetchPostByUsername } from "@/services/posts/post-api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

const UserProfilePage = () => {
  const { username } = useParams();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts-feed", "user-posts", username],
    queryFn: ({ pageParam }) => fetchPostByUsername({ username: username!, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  const posts = data?.pages.flatMap((page) => page.data) || []; 

  return (
    <div className="my-1 w-full flex items-start gap-5">
      {/* left content */}
      <div className="flex flex-col gap-5 max-w-[320px] sticky top-24 left-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className={"border rounded-xl bg-primary text-white"}
        />
      </div>
      {/* main content */}
      <div className="flex-1">
        {isAuthenticated && userInfo?.username === username && (
          <NewPost />
        )}
        <InfiniteScrollContainer
          className="flex flex-col gap-3"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {status === "pending" && <PostCardSkeleton />}
          {status === "error" && <p className="text-center text-destructive">An error occurred while loading posts.</p>}
          {posts.map((post) => (
            <PostCard key={post._id} postData={post} />
          ))}
          {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
        </InfiniteScrollContainer>
      </div>
      {/* right content */}
      <div className="flex flex-col gap-5 max-w-[340px] w-full sticky top-20 left-0">
        {/* tour recommend */}
        <ToursRecommend />
      </div>
    </div>
  )
}

export default UserProfilePage