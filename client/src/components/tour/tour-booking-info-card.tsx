
import { Tour } from "@/lib/types";
import { ArrowRight, CircleDollarSign, Clock, Heart, MapPin, Star, UsersRound } from "lucide-react"
import { Button } from "../ui/button";
import { Link } from "react-router";
import { BookingState } from "@/types/tour";
import { BookingFormValues } from "@/lib/validations";

interface TourBookingInfoCardProps {
  booking: BookingFormValues;
  tour: BookingState;
}

const TourBookingInfoCard = () => {
  return (
    <div className="p-2 flex gap-2 shadow bg-white rounded-2xl group transition-all duration-300 hover:shadow-md border border-zinc-50">
    {/* image */}
    <div className="w-60 h-40 overflow-hidden relative rounded-lg">
      <img
        //src={}
        //alt={}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow transition-colors duration-300 hover:bg-gray-100">
        <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors duration-300" />
      </button>
    </div>
    {/* content */}
    <div className="flex-1 p-2 flex items-start justify-between flex-col">
      <div className="space-y-1.5">
        <h4 className="text-base font-semibold line-clamp-1">
          {}
        </h4>
        <p className="line-clamp-2 text-xs">{}</p>
        <div className="flex items-center gap-0.5 font-semibold text-[hsla(174,100%,33%,1)]">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-xs">{}</span>
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-8">
          <div className="flex items-center py-1.5 px-3 bg-slate-50 rounded-full">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{} Good</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-[18px] w-[18px] text-primary" />
              <span className="text-xs font-medium">{}</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersRound className="h-[18px] w-[18px] text-primary" />
              <span className="text-xs font-medium">{}</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-[18px] w-[18px] text-primary" />
              <span className="text-xs font-medium">{}</span>
            </div>
          </div>
        </div>
        <Button className="rounded-2xl" asChild>
          
        </Button>
      </div>
    </div>
  </div>
  )
}

export default TourBookingInfoCard