import { Tour } from "@/lib/types";
import TourRecommendCard from "./tour-recommend-card";
import tourPhoto from "@/assets/tour-image.jpg";

const mockToursData: Tour[] = [
  {
    _id: "123123",
    name: "Hoi An Tropical Cooking Tours",
    photo: [tourPhoto],
    destination: "Hoi An, Quang Nam",
    overalReview: 4.7,
  },
  {
    _id: "456456",
    name: "Hoi An Tropical Cooking Tours",
    photo: [tourPhoto],
    destination: "Hoi An, Quang Nam",
    overalReview: 4.7,
  },
  {
    _id: "789789",
    name: "Hoi An Tropical Cooking Tours",
    photo: [tourPhoto],
    destination: "Hoi An, Quang Nam",
    overalReview: 4.7,
  }
]

const ToursRecommend = () => {
  return (
    <div>
      <h4 className="text-base text-primary font-semibold mb-2">TourRecommend</h4>

      <div className="flex flex-col w-full gap-2">
        {mockToursData.map((tour) => (
          <TourRecommendCard key={tour._id} tour={tour} />
        ))}
      </div>
    </div>
  )
}

export default ToursRecommend