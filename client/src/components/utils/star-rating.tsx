import { Star } from "lucide-react";

const StarRating = ({ rating, size = 4 }: { rating: number, size?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`star-${i}`}
          className={`size-${size} ${
            i < rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 fill-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default StarRating