import successSvg from "@/assets/successful.svg";
import { Button } from "../ui/button";
import { Link } from "react-router";

const TourBookingSuccess = () => {
  return (
    <div className="bg-white border rounded-lg p-6 pt-3 flex flex-col gap-4 items-center max-w-sm md:max-w-md lg:max-w-xl w-full shadow-sm">
      <img src={successSvg} alt="svg success" className="w-2/3" />
      <div className="text-center">
        <h3 className="mb-4 text-3xl font-pacifico text-primary font-bold">Payment Successful!</h3>
        <div className="text-sm tracking-wide text-gray-500">
          <p>Thank you for purchasing.</p>
          <p>Your payment was successfull.</p>
        </div>
      </div>

      <Button asChild className="w-full">
        <Link to={'/booking-history'}>
          See Detail
        </Link>
      </Button>
    </div>
  )
}

export default TourBookingSuccess