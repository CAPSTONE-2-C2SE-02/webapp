import TourRecommendCard from "./tour-recommend-card";
import { mockTours } from "@/lib/mock-data";

const ToursRecommend = () => {
  return (
    <div>
      <h4 className="text-base text-primary font-semibold mb-2">TourRecommend</h4>

      <div className="flex flex-col w-full gap-2">
        {mockTours.map((tour) => (
          <TourRecommendCard key={tour._id} tour={tour} />
        ))}
      </div>
    </div>
  )
}

export default ToursRecommend