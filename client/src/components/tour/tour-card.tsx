import { Tour } from "@/lib/types";
import { ArrowRight, Heart, MapPin, Star, Clock, UsersRound, CircleDollarSign, CalendarClock } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import useAuthInfo from "@/hooks/useAuth";

interface TourCardProps {
  tour: Tour;
  type?: "grid" | "list";
}

const convertLocation = (location: string) => {
  const locationSplit = location.split(",");
  if (locationSplit.length > 1) {
    return `${locationSplit[0]} - ${locationSplit[locationSplit.length - 1]}`
  }
  return locationSplit[0];
}

const TourCard = ({ tour, type }: TourCardProps) => {
  const auth = useAuthInfo();

  const generateRatingText = (rating: number | null | undefined): string => {
    if (!rating) return "No Rating";
    if (rating >= 4.5) return "Excellent";
    else if (rating >= 4.0) return "Very Good";
    else if (rating >= 3.0) return "Good";
    else if (rating >= 2.0) return "Average";
    else return "Poor";
  };

  return (
    <>
      {type === "grid" ? (
        <div className="p-2 flex flex-col shadow bg-white rounded-2xl group transition-all duration-300 hover:shadow-lg border border-zinc-50">
          {/* image */}
          <div className="w-full h-[200px] rounded-lg overflow-hidden relative transition-all duration-300 group-hover:h-[calc(200px-36px)]">
            <img
              src={tour.imageUrls[0]}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
            <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow transition-colors duration-300 hover:bg-gray-100">
              <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors duration-300" />
            </button>
          </div>

          {/* content */}
          <div className="p-2 flex flex-col items-center gap-5 flex-1 transition-opacity duration-300 group-hover:opacity-100 relative">
            <div className="space-y-2 w-full">
              <h4 className="text-sm font-semibold line-clamp-1">
                {tour.title}
              </h4>
              <p className="line-clamp-2 text-xs">{tour.introduction}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 font-semibold text-[hsla(174,100%,33%,1)]">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-xs line-clamp-1">{convertLocation(tour.destination)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <UsersRound className="h-[18px] w-[18px] text-primary" />
                    <span className="text-xs font-medium">{tour.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarClock className="h-[18px] w-[18px] text-primary" />
                    <span className="text-xs font-medium">{tour.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center py-1.5 px-3 bg-slate-50 rounded-full">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{tour?.rating > 0 && tour.rating} {generateRatingText(tour.rating)}</span>
              </div>
              <span className="text-primary text-base font-semibold">
                ${tour.priceForAdult}
              </span>
            </div>
              <Button className="absolute bottom-0 w-full justify-between rounded-full opacity-0 translate-y-3 invisible transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible" asChild>
                <Link to={`/tours/${tour._id}`}>
                  {auth?.role === "TRAVELER" ? "Book now" : "View detail"} <ArrowRight className="size-4" />
                </Link>
              </Button>
          </div>
        </div>
      ) : (
        <div className="p-2 flex gap-2 shadow bg-white rounded-2xl group transition-all duration-300 hover:shadow-md border border-zinc-50">
          {/* image */}
          <div className="w-60 h-40 overflow-hidden relative rounded-lg">
            <img
              src={tour.imageUrls[0]}
              alt={tour.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow transition-colors duration-300 hover:bg-gray-100">
              <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors duration-300" />
            </button>
          </div>
          {/* content */}
          <div className="flex-1 p-2 flex items-start justify-between flex-col">
            <div className="space-y-1.5">
              <h4 className="text-base font-semibold line-clamp-1">
                {tour.title}
              </h4>
              <p className="line-clamp-2 text-xs">{tour.introduction}</p>
              <div className="flex items-center gap-0.5 font-semibold text-[hsla(174,100%,33%,1)]">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-xs">{tour.destination}</span>
              </div>
            </div>

            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-8">
                <div className="flex items-center py-1.5 px-3 bg-slate-50 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{tour.rating} Good</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-[18px] w-[18px] text-primary" />
                    <span className="text-xs font-medium">{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersRound className="h-[18px] w-[18px] text-primary" />
                    <span className="text-xs font-medium">{tour.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-[18px] w-[18px] text-primary" />
                    <span className="text-xs font-medium">{tour.priceForAdult}</span>
                  </div>
                </div>
              </div>
              <Button className="rounded-2xl" asChild>
                <Link to={`/tours/${tour._id}`}>
                  Book now <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TourCard;
