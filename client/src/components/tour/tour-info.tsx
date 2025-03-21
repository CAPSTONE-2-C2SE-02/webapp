import { MapPin, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TourDetail } from "@/lib/types";
import TourImageGallery from "./tour-image-gallery";

interface TourInfoProps {
  tour: TourDetail;
}

export default function TourInfo({ tour }: TourInfoProps) {
  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={20} className="text-teal-500" />
          <span>Departure location: {tour.depatureLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={20} className="text-teal-500" />
          <span>Destination: {tour.destination}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={20} className="text-teal-500" />
          <span>Duration: {tour.duration}</span>
        </div>
      </div>

      {/* Main Image and Thumbnails */}
      <TourImageGallery images={tour.photos} />

      {/* Tabs */}
      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-teal-800 text-white">
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
            {tour.includes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="notInclude" className="mt-4">
          <ul className="list-disc list-inside">
            {tour.notIncludes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
