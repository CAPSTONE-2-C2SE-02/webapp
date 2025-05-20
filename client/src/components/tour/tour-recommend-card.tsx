import { Link } from "react-router";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import { Tour } from "@/lib/types";
import { getAbsoluteAddress } from "../utils/convert";

const TourRecommendCard = ({ tour }: { tour: Tour }) => {
  return (
    <Link to={`/tours/${tour._id}`}>
      <div className="bg-white relative rounded-[20px] rounded-tr-[30px] p-2 border group">
        <div className="rounded-xl h-[120px] w-full overflow-hidden">
          <img
            src={tour.imageUrls[0]}
            alt="tour image"
            className="h-full w-full object-cover group-hover:scale-110 transition-all duration-300"
          />
        </div>
        <div className="px-1 pb-1 pt-2 w-full flex items-center gap-1">
          <div>
            <div className="line-clamp-1 text-base font-semibold mb-1">
              {tour.title}
            </div>
            <div className="flex items-center gap-1 text-primary">
              <MapPin className="size-3" />
              <span className="text-xs font-medium">{getAbsoluteAddress(tour?.destination, tour?.departureLocation)}</span>
            </div>
          </div>
          {tour?.rating && (
            <div className="flex items-center gap-1 bg-primary w-fit text-white font-semibold px-2 py-1 rounded-full">
              <Star className="size-[14px]" />
              <span className="text-xs">{tour.rating}</span>
            </div>
          )}
        </div>
        {/* link icon */}
        <Link
          to={`/tours/${tour._id}`}
          className="bg-primary size-12 flex items-center justify-center text-white rounded-full absolute top-0 right-0 border-[6px] border-white group-hover:rotate-45 transition-all duration-300"
        >
          <ArrowUpRight />
        </Link>

        {/* price */}
        <div className="absolute px-2 py-1 top-1/2 right-4 rounded-lg bg-slate-300/30 backdrop-blur-sm text-xs text-white border border-white/20 font-semibold">
          From {tour?.priceForAdult} VND
        </div>
      </div>
    </Link>
  );
};

export default TourRecommendCard;
