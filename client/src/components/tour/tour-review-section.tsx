import ReviewCard from "./review-card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import StarRating from "../utils/star-rating";
import { Review } from "@/lib/types";

interface ReviewsSectionProps {
  reviews: Review[] | undefined;
  className?: string;
}

export default function TourReviewsSection({ reviews, className }: ReviewsSectionProps) {
  const [displayCount, setDisplayCount] = useState(3);

  const displayedReviews = reviews?.slice(0, displayCount);
  const hasMoreReviews = reviews && reviews.length > displayCount;

  const avgRating = reviews && reviews.length > 0 ? reviews?.reduce((acc, review) => acc + review.ratingForTour, 0) / reviews?.length : 0;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 3);
  };

  return (
    <div className={cn("bg-white p-3 border rounded-lg space-y-4", className)}>
      <div className="pr-1">
        <div className="bg-teal-100/20 border border-primary rounded-lg py-3 flex flex-col items-center gap-2 w-full shadow-[4px_4px_oklch(0.392_0.0844_240.76)]">
          <h3 className="text-base font-semibold text-primary tracking-wide">Overall Rating</h3>
          <div className="text-3xl font-bold text-primary font-pacifico">{avgRating.toFixed(1)}<span className="text-gray-500 text-lg">/5</span></div>
          <div className="flex flex-col items-center gap-1">
            <StarRating size={6} rating={avgRating} />
            <span className="text-sm text-gray-500 font-medium">based on {reviews?.length} {reviews?.length === 1 ? "review" : "reviews"}</span>
          </div>
        </div>
      </div>
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {displayedReviews?.map((review) => (
            <ReviewCard review={review} key={review._id} />
          ))}
          {hasMoreReviews && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                className="text-primary hover:text-primary/80"
              >
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 rounded-lg bg-white border shadow-sm py-2 text-sm">
          <p>This tour has no reviews yet.</p>
        </div>
      )}
    </div>
  );
}
