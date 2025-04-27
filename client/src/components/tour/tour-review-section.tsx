import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchReviewsByTourId } from "@/services/tours/review-api";
import ReviewCard from "./review-card";

interface ReviewsSectionProps {
  tourId: string | undefined;
}

export default function TourReviewsSection({ tourId }: ReviewsSectionProps) {
  const { data: reviews } = useQuery({
    queryKey: ["reviews", tourId], 
    queryFn: () => fetchReviewsByTourId(tourId!), 
    select: (data) => data.result,
    enabled: !!tourId,
  });

  return (
    <div className="mt-4">
      <div className="space-y-6">
        {reviews && reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <ReviewCard review={review} key={review._id} />
            ))}
            <Button variant="outline" className="w-full mt-4">
              Load More
            </Button>
          </>
        ) : (
          <div className="text-center text-gray-500 rounded-lg bg-white border shadow-sm py-4">
            <p>This tour has no reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
