import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Review } from "@/lib/types";
import { Link } from "react-router";
import StarRating from "../utils/star-rating";

const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="flex items-start border rounded-lg p-3 px-5 bg-white gap-6">
      <Link to={`/${review.travelerId?.username}`} prefetch="intent" className="flex flex-col items-center gap-2 flex-shrink-0">
        <Avatar className="size-12 border border-border">
          <AvatarImage src={review.travelerId?.profilePicture} alt={review.travelerId?.fullName} />
          <AvatarFallback>
            {review.travelerId?.fullName?.charAt(0) || "N"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-0">
          <div className="font-semibold text-base text-primary leading-tight">
            {review.travelerId?.fullName || "Anonymous"}
          </div>
          <span className="text-xs text-gray-500">@{review.travelerId?.username}</span>
        </div>
      </Link>
      <div className="space-y-4">
        <span className="text-xs text-primary font-medium italic">
          {review.createdAt
            ? format(new Date(review.createdAt), "p - MMMM d, yyyy")
            : "Unknown Date"}
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Badge className="rounded-full">
              Tour
            </Badge>
            <StarRating rating={review.ratingForTour} />
          </div>
          <p className="text-gray-600 text-sm">
            {review.reviewTour || "No tour review provided"}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Badge className="rounded-full">
              Tour Guide
            </Badge>
            <StarRating rating={review.ratingForTourGuide} />
          </div>
          <p className="text-gray-600 text-sm">{review.reviewTourGuide || "No tour guide review provided"}</p>
        </div>
      </div>
      <div className="flex">
        {review.imageUrls && review.imageUrls.length > 0 && (
          <div className="flex gap-2 mt-2">
            {review.imageUrls.map((imageUrl, i) => (
              <img
                key={i}
                src={imageUrl}
                alt={`Review Image ${i}`}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
