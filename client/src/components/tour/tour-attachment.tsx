import { Tour } from "@/lib/types";
import { MapPin, X } from "lucide-react";
import { Link } from "react-router";

interface TourAttachmentProps {
  tour: Tour;
  onRemove?: () => void;
}

const TourAttachment = ({ tour, onRemove }: TourAttachmentProps) => {
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <Link to={`/tours/tourId?fromPost=true`} className="group relative">
      <div className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-6 mt-2 group-hover:shadow-sm">
        <div className="w-60 h-32 rounded-xl overflow-hidden">
          <img
            src="https://placehold.co/600x400"
            alt="photo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-medium text-primary line-clamp-2">
            {tour.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-emerald-600 font-medium">
            <MapPin className="size-3" />
            <span className="text-sm">{tour.location}</span>
          </div>
          <p className="text-xs line-clamp-2 mt-1">
            {tour.description}
          </p>
        </div>
      </div>
      {onRemove && (
        <button
          className="absolute top-2 right-2 bg-black/20 rounded-full p-0.5"
          onClickCapture={handleRemove}
        >
          <X className="h-4 w-4 text-white" />
        </button>
      )}
    </Link>
  );
};

export default TourAttachment;
