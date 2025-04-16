import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { fetchReviewByTourGuideId } from "@/services/tours/review-api";
import { format } from "date-fns";

interface ReviewsSectionProps {
  tourGuideId: string;
}

export default function TourReviewsSection({ tourGuideId }: ReviewsSectionProps) {
  const { data: reviews } = useQuery({
    queryKey: ["reviews", tourGuideId], 
    queryFn: () => fetchReviewByTourGuideId(tourGuideId), 
  });
  return (
    <div className="mt-4">
      <div className="space-y-6">
        {reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
          <div key={index} className="flex flex-col border rounded-lg p-4 bg-white shadow-md gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="size-12 border border-border">
                <AvatarImage />
                <AvatarFallback>{review.travelerId?.fullName?.charAt(0) || "N"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{review.travelerId?.fullName || "Anonymous"}</p>
                <p className="text-sm text-gray-500">{review.createdAt
                      ? format(new Date(review.createdAt), "dd/MM/yyyy")
                      : "Unknown Date"}</p>
              </div>
              <div className="ml-auto flex gap-1">
                {[...Array(review.ratingForTour || 0)].map((_, i) => (
                    <Star key={i} className="text-yellow-400" fill="#FFC400" size={16} />
                  ))}
              </div>
            </div>
            <div className="text-gray-600">
              <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">Tour</Badge>
              <p className="text-gray-600">{review.reviewTour || "No tour review provided"}</p>
            </div>
            <div className="text-gray-600">
              <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">Tour Guide</Badge>
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
        ))
        ) : (
          <p className="text-center text-gray-500">no review.</p>
        )}
        
      </div>
      <Button variant="outline" className="w-full mt-4">
        Load More
      </Button>
    </div>
  );
}
