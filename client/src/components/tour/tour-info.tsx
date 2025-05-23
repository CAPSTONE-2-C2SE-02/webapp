import { MapPin, UsersRound, BookCheck, Check, X, CalendarDays } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour } from "@/lib/types";
import TourImageGallery from "./tour-image-gallery";
import { getAbsoluteAddress } from "../utils/convert";
import BookMarkButton from "@/components/utils/book-mark-button";
import useAuthInfo from "@/hooks/useAuth";

interface TourInfoProps {
  tour: Tour;
}

export default function TourInfo({ tour }: TourInfoProps) {
  const auth = useAuthInfo();

  return (
    <div className="relative w-full bg-white px-6 py-5 rounded-lg shadow-sm border border-border">
      <BookMarkButton
        className="absolute top-5 right-6"
        itemType="tour"
        itemId={tour?._id}
        initialState={{
          isBookmarkedByUser: tour.bookmarks.some(bookmark => bookmark.user === auth?._id),
        }}
      />
      <h1 className="text-3xl font-bold mb-4 text-start text-primary max-w-[92%]">{tour.title}</h1>
      <div className="grid grid-cols-2 gap-2 mb-4 mr-1 text-sm bg-slate-50/60 p-3 rounded-md border shadow-[3px_4px_oklch(0.392_0.0844_240.76)]">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="size-4" />
          <span className="font-medium"><span className="text-teal-500">{getAbsoluteAddress(tour.destination, tour.departureLocation)}</span></span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <CalendarDays className="size-4" />
          <span className="font-medium">Duration: <span className="text-teal-500">{tour.duration}</span> {tour.duration > 1 ? "days" : "day"}</span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <UsersRound className="size-4" />
          <span className="font-medium">Max participants: <span className="text-teal-500">{tour.maxParticipants}</span></span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <BookCheck className="size-4"/>
          <span className="font-medium">Bookings: <span className="text-teal-500">{tour.totalBookings}</span></span>
        </div>
      </div>

      {/* Main Image and Thumbnails */}
      <TourImageGallery images={tour.imageUrls} />

      {/* Tabs */}
      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-primary text-white">
          <TabsTrigger value="introduction">Introduction</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="include">Include</TabsTrigger>
          <TabsTrigger value="notInclude">Not Include</TabsTrigger>
        </TabsList>
        <TabsContent value="introduction" className="mt-4">
          <div className="p-3 py-2.5 border border-border rounded-md text-base space-y-3">
            <h5 className="text-primary font-bold uppercase text-lg font-madimi">About the tour</h5>
            {tour.introduction.split("\n").map((line, index) => (
              <p key={index} className="text-sm">{line}</p>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="schedule" className="mt-4 space-y-3">
          {tour.schedule.map((day, index) => (
            <div key={index} className="px-3 py-2 border border-border rounded-md">
              <h4 className="text-primary font-bold uppercase text-lg font-madimi">Day {index + 1}</h4>
              <h5 className="font-semibold">{day.title}</h5>
              {day.description.split("\n").map((line, index) => (
                <p key={index} className="text-sm">{line}</p>
              ))}
            </div>
          ))}
        </TabsContent>
        <TabsContent value="include" className="mt-4">
          <ul className="list-none space-y-1">
            {tour.include.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="text-green-500 size-4 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="notInclude" className="mt-4">
          <ul className="list-none space-y-1">
            {tour.notInclude.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <X className="text-red-500 size-4 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
