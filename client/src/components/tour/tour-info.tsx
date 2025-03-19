import { MapPin, Clock } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour } from "@/types/tour";

interface TourInfoProps {
    tour: Tour;
}

export function TourInfo({ tour }: TourInfoProps) {
    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4">{tour.name}</h1>
            <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={20} className="text-teal-500" />
                    <span>Departure location: {tour.departureLocation}</span>
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
            <div className="mb-4">
                <img
                    src={tour.images[0]}
                    alt="Main Tour Image"
                    className="w-full h-96 object-cover rounded-lg"
                />
                <Carousel className="mt-4 mr-4 ml-4">
                    <CarouselContent>
                        {tour.images.slice(1).map((image, index) => (
                            <CarouselItem key={index} className="basis-1/3">
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-4" />
                    <CarouselNext className="mr-4" />
                </Carousel>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="introduction" className="w-full">
                <TabsList className="grid grid-cols-4 w-full bg-teal-800 text-white">
                    <TabsTrigger value="introduction">Introduction</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="include">Include</TabsTrigger>
                    <TabsTrigger value="notInclude">Not Include</TabsTrigger>
                </TabsList>
                <TabsContent value="introduction" className="mt-4">
                    <div className="prose" dangerouslySetInnerHTML={{ __html: tour.introduction }} />
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
                    <p>{tour.include}</p>
                </TabsContent>
                <TabsContent value="notInclude" className="mt-4">
                    <p>{tour.notInclude}</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}