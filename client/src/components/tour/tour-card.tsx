import { Tour } from "@/lib/types";
import { ArrowRight, MapPin, Star, UsersRound, CircleDollarSign, CalendarClock } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import useAuthInfo from "@/hooks/useAuth";
import { generateRatingText, getAbsoluteAddress } from "../utils/convert";
import BookMarkButton from "@/components/utils/book-mark-button";

interface TourCardProps {
  tour: Tour;
  type?: "grid" | "list";
}

const TourCard = ({ tour, type = "grid" }: TourCardProps) => {
  const auth = useAuthInfo();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      {type === "grid" ? (
        <Link to={`/tours/${tour._id}`} className="w-full">
          <div className="relative overflow-hidden p-2 flex flex-col border shadow-sm bg-white rounded-2xl group transition-all duration-300 hover:shadow-lg group">
            {/* image */}
            <div className="w-full h-[200px] rounded-lg overflow-hidden relative transition-all duration-300">
              <img
                src={tour.imageUrls[0]}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              <div onClick={handleBookmarkClick}>
                <BookMarkButton
                  className="absolute top-3 right-3"
                  itemType="tour"
                  itemId={tour?._id}
                  initialState={{
                    isBookmarkedByUser: tour.bookmarks.some(bookmark => bookmark.user === auth?._id),
                  }}
                />
              </div>
            </div>

            {/* content */}
            <div className="p-2 pt-3 flex flex-col items-center gap-5 flex-1 bg-white group-hover:-translate-y-10 transition-all duration-300">
              <div className="space-y-2 w-full">
                <h4 className="text-sm font-semibold line-clamp-1">
                  {tour.title}
                </h4>
                <p className="line-clamp-2 text-xs">{tour.introduction}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 font-semibold text-[hsla(174,100%,33%,1)]">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-xs line-clamp-1">
                      {getAbsoluteAddress(tour.destination, tour.departureLocation)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <UsersRound className="h-[18px] w-[18px] text-primary" />
                      <span className="text-xs font-medium">
                        {tour.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-[18px] w-[18px] text-primary" />
                      <span className="text-xs font-medium">{tour.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center py-1.5 px-3 bg-slate-100 rounded-full gap-1 text-primary">
                  {tour?.rating > 0 && (
                    <>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">
                        {tour?.rating > 0 && tour.rating}
                      </span>
                      <span className="leading-3">&bull;{" "}</span>
                    </>
                  )}
                  <span className="text-xs font-semibold">
                    {generateRatingText(tour.rating)}
                  </span>
                </div>
                <span className="text-primary text-base font-semibold">
                  ${tour.priceForAdult}
                </span>
              </div>
              <Button
                className="absolute -bottom-10 w-full justify-between rounded-full opacity-0  invisible transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible"
                asChild
              >
                <Link to={`/tours/${tour._id}`}>
                  {auth?.role === "TRAVELER" ? "Book now" : "View detail"}{" "}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Link>
      ) : (
        <Link to={`/tours/${tour._id}`} className="w-full">
          <div className="p-2 flex gap-2 shadow bg-white rounded-2xl group transition-all duration-300 hover:shadow-md border border-zinc-50">
            {/* image */}
            <div className="w-60 h-40 overflow-hidden relative rounded-lg">
              <img
                src={tour.imageUrls[0]}
                alt={tour.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div onClick={handleBookmarkClick}>
                <BookMarkButton
                  className="absolute top-3 right-3"
                  itemType="tour"
                  itemId={tour?._id}
                  initialState={{
                    isBookmarkedByUser: tour.bookmarks.some(bookmark => bookmark.user === auth?._id),
                  }}
                />
              </div>
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
                  <span className="text-xs">{getAbsoluteAddress(tour.destination, tour.departureLocation)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-8">
                  <div className="flex items-center py-1.5 px-3 bg-slate-50 rounded-full gap-1 text-primary">
                    {tour?.rating > 0 && (
                      <>
                        <span className="text-sm font-medium">
                          {tour?.rating > 0 && tour.rating}
                        </span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </>
                    )}
                    <span className="text-xs font-semibold">
                      {generateRatingText(tour.rating)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-[18px] w-[18px] text-primary" />
                      <span className="text-xs font-medium">{tour.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersRound className="h-[18px] w-[18px] text-primary" />
                      <span className="text-xs font-medium">
                        {tour.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-[18px] w-[18px] text-primary" />
                      <span className="text-xs font-medium">
                        {tour.priceForAdult}
                      </span>
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
        </Link>
      )}
    </>
  );
};

export default TourCard;
