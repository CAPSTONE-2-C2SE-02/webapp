import { Tour } from "@/lib/types"
import { Link } from "react-router"

interface TourSearchItemProps {
  tour: Tour;
}

const TourSearchItem = ({ tour }: TourSearchItemProps) => {
  return (
    <Link to={`/tours/${tour._id}`} prefetch="intent">
      <div className="bg-white hover:bg-gray-100 p-2 rounded-md flex items-center gap-3">
        <div className="w-14 h-10 rounded-md overflow-hidden">
          <img src={tour?.imageUrls[0]} alt={tour.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col items-start gap-0 flex-1">
          <h5 className="font-medium text-sm text-primary line-clamp-1">{tour?.title}</h5>
          <span className="font-normal text-xs text-gray-400">{tour?.destination}</span>
        </div>
      </div>
    </Link>
  )
}

export default TourSearchItem;