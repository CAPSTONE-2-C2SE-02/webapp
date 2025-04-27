import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Star } from "lucide-react";
import { Badge } from "../ui/badge";
import { Review } from "@/lib/types";

const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="flex flex-col border rounded-lg p-4 bg-white shadow-md gap-2">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="size-12 border border-border">
          <AvatarImage src={review.travelerId?.profilePicture} alt={review.travelerId?.fullName} />
          <AvatarFallback>
            {review.travelerId?.fullName?.charAt(0) || "N"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            {review.travelerId?.fullName || "Anonymous"}
          </p>
          <p className="text-sm text-gray-500">
            {review.createdAt
              ? format(new Date(review.createdAt), "dd/MM/yyyy")
              : "Unknown Date"}
          </p>
        </div>
        <div className="ml-auto flex gap-1">
          {Array.from({ length: review.ratingForTourGuide }).map((_, i) => (
            <Star
              key={i}
              className="text-yellow-400"
              fill="#FFC400"
              size={16}
            />
          ))}
        </div>
      </div>
      <div className="text-gray-600">
        <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">
          Tour
        </Badge>
        <p className="text-gray-600">
          {review.reviewTour || "No tour review provided"}
        </p>
      </div>
      <div className="text-gray-600">
        <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">
          Tour Guide
        </Badge>
        <p>{review.reviewTourGuide || "No tour guide review provided"}</p>
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
