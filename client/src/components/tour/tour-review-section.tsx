import ReviewCard from "./review-card";
import { useState } from "react";
import { Button } from "../ui/button";
import { Review } from "@/lib/types";

interface ReviewsSectionProps {
  reviews: Review[] | undefined;
}

export default function TourReviewsSection({ reviews }: ReviewsSectionProps) {
  const [displayCount, setDisplayCount] = useState(3);

  const displayedReviews = reviews?.slice(0, displayCount);
  const hasMoreReviews = reviews && reviews.length > displayCount;


  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 3);
  };

  return (
    <>
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
    </>
  );
}
