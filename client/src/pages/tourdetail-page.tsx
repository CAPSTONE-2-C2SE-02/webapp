import TourBookingSection from "@/components/tour/tour-booking-section";
import TourInfo from "@/components/tour/tour-info";
import TourReviewsSection from "@/components/tour/tour-review-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import MetaData from "@/components/utils/meta-data";
import ScrollToTopOnMount from "@/components/utils/scroll-to-top-mount";
import { tourData } from "@/lib/mock-data";
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2">
            <TourInfo tour={tour} />
            <TourReviewsSection tourGuideId={tourData.author._id} />
          </div>
          <TourBookingSection tourData={tour} />
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
