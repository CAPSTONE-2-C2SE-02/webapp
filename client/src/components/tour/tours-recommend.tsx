import { useGetRecommendations } from "@/services/recommend-service";
import TourRecommendCard from "./tour-recommend-card";
import useAuthInfo from "@/hooks/useAuth";
import TourRecommendCardSkeleton from "@/components/skeleton/tour-recommend-card-skeleton";

const ToursRecommend = () => {
  const auth = useAuthInfo();
  const userId = auth?._id || "";
  const { data: recommendations, isLoading } = useGetRecommendations(userId || "", 3);
  return (
    <div>
      <h4 className="text-base text-primary font-semibold mb-2">TourRecommend</h4>
      <div className="flex flex-col w-full gap-2">
        {isLoading ? (
          <>
            <TourRecommendCardSkeleton />
            <TourRecommendCardSkeleton />
            <TourRecommendCardSkeleton />
          </>
        ) : (
          <>
            {recommendations?.tours.map((item) => (
              <TourRecommendCard key={item.tour._id} tour={item.tour} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default ToursRecommend