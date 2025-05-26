import MapTour from "@/components/map/map-view/map-tour";
import TourBookingSection from "@/components/tour/tour-booking-section";
import TourInfo from "@/components/tour/tour-info";
import TourReviewsSection from "@/components/tour/tour-review-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import MetaData from "@/components/utils/meta-data";
import ScrollToTopOnMount from "@/components/utils/scroll-to-top-mount";
import StarRating from "@/components/utils/star-rating";
import { fetchReviewsByTourId } from "@/services/tours/review-api";
import { fetchTourById } from "@/services/tours/tour-api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

const TourDetailPage = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const { data: tour, isLoading } = useQuery({
    queryKey: ["tour", tourId],
    queryFn: async () => fetchTourById(tourId as string),
    enabled: !!tourId,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", tourId], 
    queryFn: () => fetchReviewsByTourId(tourId as string), 
    select: (data) => data.result,
    enabled: !!tourId,
  });

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Tours", path: "/tours" },
    { label: tour?.title || "Tour Detail" },
  ];

  const avgRating = reviews && reviews.length > 0 ? reviews?.reduce((acc, review) => acc + review.ratingForTour, 0) / reviews?.length : 0;

  return (
    <div className="my-4 space-y-4">
      {tour?.title && <MetaData title={tour?.title} />}
      <ScrollToTopOnMount />
      <Breadcrumb items={breadcrumbItems} />
      {!isLoading && tour && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 lg:col-span-2">
            <TourInfo tour={tour} />
            <div className="bg-white p-3 border rounded-lg space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="pr-1">
                  <div className="bg-slate-50/60 border border-primary rounded-lg py-6 flex flex-col items-center gap-2 w-full shadow-[4px_4px_oklch(0.392_0.0844_240.76)]">
                    <h3 className="text-base font-semibold text-primary tracking-wide">Overall Rating</h3>
                    <div className="text-3xl font-bold text-primary font-pacifico">{avgRating.toFixed(1)}<span className="text-gray-500 text-lg">/5</span></div>
                    <div className="flex flex-col items-center gap-1">
                      <StarRating size={6} rating={avgRating} />
                      <span className="text-sm text-gray-500 font-medium">based on {reviews?.length} {reviews?.length === 1 ? "review" : "reviews"}</span>
                    </div>
                  </div>
                </div>
                <MapTour tourData={tour} />
              </div>
              <TourReviewsSection reviews={reviews} />
            </div>
          </div>
          <TourBookingSection tourData={tour} />
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
