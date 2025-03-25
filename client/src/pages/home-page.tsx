import NewPost from "@/components/post/new-post";
import PostCard from "@/components/post/post-card";
import TrendingTopics from "@/components/post/trending-topics";
import ToursRecommend from "@/components/tour/tours-recommend";
import TourguidesRanking from "@/components/user/tourguides-ranking";
import UserHomeInfo from "@/components/user/user-home-info";
import { useAppSelector } from "@/hooks/redux";
import { useGetNewFeedsQuery } from "@/services/post-api";

const HomePage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetNewFeedsQuery();
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
        <div className="flex flex-col gap-3">
          {!isLoading && data?.result?.data.map(post => (
            <PostCard key={post._id} postData={post} />
          ))}
        </div>
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