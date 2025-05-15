import TourBookingSection from "@/components/tour/tour-booking-section";
import TourInfo from "@/components/tour/tour-info";
import TourReviewsSection from "@/components/tour/tour-review-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import MetaData from "@/components/utils/meta-data";
import ScrollToTopOnMount from "@/components/utils/scroll-to-top-mount";
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

  return (
    <div className="my-4 space-y-4">
      {tour?.title && <MetaData title={tour?.title} />}
      <ScrollToTopOnMount />
      <Breadcrumb items={breadcrumbItems} />
      {!isLoading && tour && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 lg:col-span-2">
            <TourInfo tour={tour} />
            <TourReviewsSection reviews={reviews} className="mt-4" />
          </div>
          <TourBookingSection tourData={tour} />
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
