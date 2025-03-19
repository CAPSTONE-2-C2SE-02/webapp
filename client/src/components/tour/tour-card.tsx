import { Tour } from "@/lib/types"
import { ArrowRight, Heart, MapPin, Star } from "lucide-react";
import { Button } from "../ui/button";

interface TourCardProps {
  tour: Tour;
  type?: "grid" | "list";
}

const TourCard = ({ tour, type }: TourCardProps) => {
  return (
    <div className="p-2 flex flex-col shadow bg-white rounded-2xl group">
      <div className="w-full rounded-lg overflow-hidden relative">
        <img src={tour.photo[0]} alt={tour.title} className="w-full h-full object-cover" />
        <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full">
          <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
        </button>
      </div>
      <div className="p-2 flex flex-col items-center gap-5">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold line-clamp-1">{tour.title}</h4>
          <p className="line-clamp-2 text-xs">{tour.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 font-semibold text-[hsla(174,100%,33%,1)]">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-xs">{tour.location}</span>
            </div>
            <span className="text-xs text-gray-600">{tour.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center py-1.5 px-3 bg-slate-50 rounded-full">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{tour.rating} Good</span>
          </div>
          <span className="text-primary text-base font-semibold">${tour.price}</span>
        </div>

        <Button className="w-full justify-between rounded-full">
          Book now <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export default TourCard