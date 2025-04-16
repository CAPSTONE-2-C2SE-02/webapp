import { MapPin, Clock, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour } from "@/lib/types";
import TourImageGallery from "./tour-image-gallery";

interface TourInfoProps {
  tour: Tour;
}

export default function TourInfo({ tour }: TourInfoProps) {
  return (
    <div className="w-full bg-white px-6 py-5 rounded-lg shadow-sm border border-border">
      <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex items-center gap-2 text-primary col-span-2">
          <MapPin className="size-5" />
          <span className="font-medium">Destination: <span className="text-teal-500">{tour.destination}</span></span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Clock className="size-5" />
          <span className="font-medium">Duration: <span className="text-teal-500">{tour.duration}</span></span>
        </div>
        <div className="flex items-center gap-2 text-primary col-span-2">
          <MapPin className="size-5"/>
          <span className="font-medium">Departure location: <span className="text-teal-500">{tour.departureLocation}</span></span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <UsersRound className="size-5" />
          <span className="font-medium">Max participants: <span className="text-teal-500">{tour.maxParticipants}</span></span>
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
            className="prose"
            dangerouslySetInnerHTML={{ __html: tour.introduction }}
          />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          {tour.schedule.map((day, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">{day.title}</h3>
              <p>{day.description}</p>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="include" className="mt-4">
          <ul className="list-disc list-inside">
            {tour.include.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="notInclude" className="mt-4">
          <ul className="list-disc list-inside">
            {tour.notInclude.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
