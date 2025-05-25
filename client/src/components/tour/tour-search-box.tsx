import { Map, MapPin, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { searchTours } from "@/services/tours/tour-api";
import { ScrollArea } from "../ui/scroll-area";
import TourSearchItem from "./tour-search-item";
import MapOverview from "../map/map-view/map-overview";

const TourSearchBox = () => {
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce<string>(searchQuery, 1000);

  const { data, isLoading } = useQuery({
    queryKey: ["tours-search", debouncedSearch],
    queryFn: () => searchTours(debouncedSearch),
    enabled: Boolean(debouncedSearch),
  });

  const removeSearchQuery = () => setSearchQuery("");

  return (
    <>
      <div className="absolute max-w-[800px] w-full left-1/2 bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-border -translate-x-1/2 bottom-0 translate-y-1/3 flex items-center gap-3 z-40">
        <div className="px-4 py-2.5 rounded-lg bg-white flex items-center justify-center gap-4 border border-border flex-1 relative">
          <MapPin className="size-4 text-primary" />
          <input
            type="text"
            className="border-none outline-none flex-1 text-sm placeholder:text-sm"
            placeholder="Where are you going?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button variant={"ghost"} size={"icon"} className="absolute right-0.5" onClick={removeSearchQuery}>
              <X className="text-red-500 size-3" />
            </Button>
          )}
        </div>
        <Button className="text-white h-[40px]" onClick={() => setIsMapOpen(true)}>
          <Map className="size-4" /> Map
        </Button>

        {/* Search result */}
        {searchQuery && (
          <div className="absolute top-16 max-w-[646px] w-full bg-white p-2 rounded-lg flex flex-col border border-muted shadow-md">
            <p className="text-xs text-center font-medium text-primary">Search result for "{searchQuery}"</p>
            {isLoading && <p className="">Searching tour...</p>}
            {data?.result && data.result.length <= 0 && <p className="p-3 mt-2 text-center text-sm rounded-md bg-gray-100">Not found tours</p>}
            {data?.result && data.result.length > 0 && (
              <ScrollArea className="max-h-80 w-full mt-2">
                <div className="space-y-1 w-full">
                  {data?.success && data.result?.map((tour) => (
                    <TourSearchItem key={tour._id} tour={tour} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
      <MapOverview isOpen={isMapOpen} onChange={setIsMapOpen} />
    </>
  );
};

export default TourSearchBox;
