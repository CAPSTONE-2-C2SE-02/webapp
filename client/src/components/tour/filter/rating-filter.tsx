import { Label } from "@/components/ui/label";
import FilterWrapper from "./filter-wrapper";
import { Star } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RatingFilterProps {
  minRating: number;
  setMinRating: (value: number) => void;
}

const RatingFilter = ({ minRating, setMinRating }: RatingFilterProps) => {
  return (
    <FilterWrapper title="Rating">
      <RadioGroup
        className="space-y-2"
        value={minRating ? minRating.toString() : ""}
        onValueChange={(val) => setMinRating(Number(val))}
      >
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                id={`rating-${rating}`}
                value={rating.toString()}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 mr-0.5 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                {rating < 5 && <span className="ml-2 text-primary"> above</span>}
              </Label>
            </div>
            <span className="text-sm text-gray-500">12</span>
          </div>
        ))}
      </RadioGroup>
    </FilterWrapper>
  );
};

export default RatingFilter;
