import TourBookingSection from "@/components/tour/tour-booking-section";
import TourInfo from "@/components/tour/tour-info";
import TourReviewsSection from "@/components/tour/tour-review-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import ScrollToTopOnMount from "@/components/utils/scroll-to-top-mount";
import { tourData } from "@/lib/mock-data";

const TourDetailPage = () => {
  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Tours", path: "/tours" },
    { label: "Tour Da Nang - Hoi An" },
  ];
  return (
    <div className="p-6 space-y-5">
      <ScrollToTopOnMount />
      <Breadcrumb items={breadcrumbItems} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <TourInfo tour={tourData} />
          <TourReviewsSection reviews={tourData.reviews} />
        </div>
        <TourBookingSection toursGuide={tourData.author} price={tourData.priceForAdult} />
      </div>
    </div>
  );
};

export default TourDetailPage;
