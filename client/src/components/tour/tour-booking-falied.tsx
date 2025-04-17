import failedSvg from "@/assets/failed.svg";
import { Button } from "../ui/button";
import { Link } from "react-router";

const TourBookingFailed = () => {
  return (
    <div className="bg-white border rounded-lg p-6 pt-3 flex flex-col gap-4 items-center max-w-sm md:max-w-md lg:max-w-xl w-full shadow-sm">
      <div className="w-2/3 aspect-square overflow-hidden">
        <img src={failedSvg} alt="svg success" className="w-full h-full scale-150" />
      </div>
      <div className="text-center">
        <h3 className="mb-4 text-3xl font-pacifico text-red-400 font-bold">Oops!</h3>
        <div className="text-sm tracking-wide text-gray-500">
          <p>Something went wrong.</p>
          <p>We couldn't process your payment.</p>
        </div>
      </div>

      <Button asChild className="w-full bg-red-400 hover:bg-red-500">
        <Link to={'/tours'}>
          Explore More Tours
        </Link>
      </Button>
    </div>
  )
}

export default TourBookingFailed