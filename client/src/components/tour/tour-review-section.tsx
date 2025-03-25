import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Review } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Coffee } from "lucide-react";

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function TourReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4 text-teal-800">Reviews</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
          <Star className="text-yellow-400 mx-auto mb-2" fill="#FFC400" size={32} />
          <p className="text-sm text-gray-500 uppercase">Overall Rating</p>
          <p className="text-lg font-semibold">4.8</p>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white text-center">
          <Coffee className="text-teal-500 mx-auto mb-2" size={32} />
          <p className="text-sm text-gray-500 uppercase">Total Reviews</p>
          <p className="text-lg font-semibold">23</p>
        </div>
      </div>
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="flex flex-col border rounded-lg p-4 bg-white shadow-md gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="size-12 border border-border">
                <AvatarImage />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{review.user}</p>
                <p className="text-sm text-gray-500">{review.createdAt}</p>
              </div>
              <div className="ml-auto flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-400" fill="#FFC400" size={16} />
                ))}
              </div>
            </div>
            <div className="text-gray-600">
              <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">Tour</Badge>
              <p className="text-gray-600">{review.tourReview}</p>
            </div>
            <div className="text-gray-600">
              <Badge className="inline-block px-3 py-1 border bg-white text-primary border-gray-300 rounded-full text-xs truncate min-w-fit">Tour Guide</Badge>
              <p>{review.tourGuideReview}</p>
            </div>
            <div className="flex">
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {review.images.map((image, i) => (
                    <img
                      key={i}
                      src={image}
                      alt={`Review Image ${i}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full mt-4">
        Load More
      </Button>
    </div>
  );
}
