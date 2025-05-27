import TourRecommendCardSkeleton from "@/components/skeleton/tour-recommend-card-skeleton";
import useAuthInfo from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useGetRecommendations } from "@/services/recommend-service";
import TourRecommendCard from "./tour-recommend-card";

const ToursRecommend = ({ type = "col", className } : { type?: "col" | "row", className?: string }) => {
  const auth = useAuthInfo();
  const userId = auth?._id || "";
  const { data: recommendations, isLoading } = useGetRecommendations(userId || "", 3);
  return (
    <div className={className}>
      <h4 className="text-base text-primary font-semibold mb-2">Recommended Tour</h4>
      <div className={cn("grid w-full gap-2", type === "col" ? "grid-cols-1" : "grid-cols-3")}>
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