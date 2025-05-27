import TourCardSkeleton from "@/components/skeleton/tour-card-skeleton";
import TourCard from "@/components/tour/tour-card";
import { Tour } from "@/lib/types"
import emptyArt from "@/assets/empty-art.svg";

interface TourBookmarkProps {
  data: Tour[] | undefined;
  status: "error" | "success" | "pending";
}

const TourBookmark = ({ data, status }: TourBookmarkProps) => {
  if (status === "pending") {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive text-sm">
        An error occurred while loading.
      </p>
    )
  }

  if (status === "success" && !data?.length) {
    return (
      <div className="text-center text-muted-foreground">
        <img src={emptyArt} alt="empty" className="w-40 h-40 mx-auto" />
        <span className="text-base">No tours found.</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {data?.map((tour) => (
        <TourCard key={tour._id} tour={tour} />
      ))}
    </div>
  )
}

export default TourBookmark