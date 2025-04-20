import { MapPin, Clock, UsersRound, BookCheck, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour } from "@/lib/types";
import TourImageGallery from "./tour-image-gallery";
import { Separator } from "../ui/separator";

interface TourInfoProps {
  tour: Tour;
}

const getAbsoluteAddress = (location: string) => location.split(",")[0];

export default function TourInfo({ tour }: TourInfoProps) {
  return (
    <div className="w-full bg-white px-6 py-5 rounded-lg shadow-sm border border-border">
      <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex items-center gap-2 text-primary col-span-2">
          <MapPin className="size-5" />
          <span className="font-medium"><span className="text-teal-500">{getAbsoluteAddress(tour.destination)} - {getAbsoluteAddress(tour.departureLocation)}</span></span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Clock className="size-5" />
          <span className="font-medium">Duration: <span className="text-teal-500">{tour.duration}</span> {tour.duration > 1 ? "days" : "day"}</span>
        </div>
        <div className="flex items-center gap-2 text-primary col-span-2">
          <UsersRound className="size-5" />
          <span className="font-medium">Max participants: <span className="text-teal-500">{tour.maxParticipants}</span></span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <BookCheck className="size-5"/>
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
          <div
            className="p-2 px-3 border border-border rounded-md"
            dangerouslySetInnerHTML={{ __html: tour.introduction }}
          />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4 space-y-3">
          {tour.schedule.map((day, index) => (
            <div key={index} className="px-3 py-2 border border-border rounded-md">
              <h4 className="text-primary font-bold uppercase text-lg">Day {index + 1}</h4>
              <Separator className="my-1.5" />
              <h5 className="font-semibold">{day.title}</h5>
              <p>{day.description}</p>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="include" className="mt-4">
          <ul className="list-none space-y-1">
            {tour.include.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="text-green-500 size-4" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="notInclude" className="mt-4">
          <ul className="list-none space-y-1">
            {tour.notInclude.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <X className="text-red-500 size-4" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
