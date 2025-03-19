import { Label } from "@/components/ui/label";
import FilterWrapper from "./filter-wrapper";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";

interface RatingFilterProps {
  selectedRatings: number[];
  handleRatingChange: (rating: number) => void;
}

const RatingFilter = ({ selectedRatings, handleRatingChange }: RatingFilterProps) => {
  return (
    <FilterWrapper title="Rating">
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRatings.includes(rating)}
                onCheckedChange={() => handleRatingChange(rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </Label>
            </div>
            <span className="text-sm text-gray-500">12</span>
          </div>
        ))}
      </div>
    </FilterWrapper>
  );
};

export default RatingFilter;
