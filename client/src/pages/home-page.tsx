import InfiniteScrollContainer from "@/components/post/infinite-scroll-container";
import NewPost from "@/components/post/new-post";
import PostCard from "@/components/post/post-card";
import TrendingTopics from "@/components/post/trending-topics";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import ToursRecommend from "@/components/tour/tours-recommend";
import AttendanceWidget from "@/components/user/attendance-widget";
import TourguidesRanking from "@/components/user/tourguides-ranking";
import UserHomeInfo from "@/components/user/user-home-info";
import ScrollToTopOnMount from "@/components/utils/scroll-to-top-mount";
import { useAppSelector } from "@/hooks/redux";
import { fetchNewsFeed } from "@/services/posts/post-api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
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
    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const posts = postsData?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="mt-3 lg:mt-5 w-full flex items-start gap-5">
      <ScrollToTopOnMount />
      {/* left content */}
      <div className="hidden lg:flex flex-col gap-5 max-w-[280px] w-full sticky top-[93px] left-0 max-h-[calc(100vh-93px)] overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* user info */}
        {isAuthenticated && <UserHomeInfo />}
        {/* tour recommend */}
        <ToursRecommend />
      </div>
      {/* main content */}
      <div className="w-full lg:flex-1">
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
      <div className="hidden md:flex flex-col gap-5 max-w-[340px] w-full sticky top-[93px] left-0 max-h-[calc(100vh-93px)] overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* top ranking */}
        <TourguidesRanking />
        {/* checkin widget */}
        {isAuthenticated && userInfo?.role === "TOUR_GUIDE" && <AttendanceWidget />}
        <TrendingTopics />
      </div>
    </div>
  )
};

export default HomePage;