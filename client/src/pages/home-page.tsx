import InfiniteScrollContainer from "@/components/post/infinite-scroll-container";
import NewPost from "@/components/post/new-post";
import PostCard from "@/components/post/post-card";
import TrendingTopics from "@/components/post/trending-topics";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import ToursRecommend from "@/components/tour/tours-recommend";
import TourguidesRanking from "@/components/user/tourguides-ranking";
import UserHomeInfo from "@/components/user/user-home-info";
import { useAppSelector } from "@/hooks/redux";
import { fetchNewsFeed } from "@/services/posts/post-api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts-feed"],
    queryFn: fetchNewsFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextPage || undefined,
  });

  const posts = postsData?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="my-5 w-full flex items-start gap-5">
      {/* left content */}
      <div className="flex flex-col gap-5 max-w-[280px]">
        {/* user info */}
        {isAuthenticated && <UserHomeInfo />}

        {/* tour recommend */}
        <ToursRecommend />
      </div>
      {/* main content */}
      <div className="flex-1">
        {isAuthenticated && <NewPost />}
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
      <div className="flex flex-col gap-5 max-w-[340px] w-full">
        <TourguidesRanking />
        <TrendingTopics />
      </div>
    </div>
  )
};

export default HomePage;