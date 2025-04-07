import { MapPin, Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { fetchAllSearchTours } from "@/services/tours/tour-api";
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "react-router";

const TourSearchBox = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce<string>(searchQuery, 1000);

  const { data, isLoading } = useQuery({
    queryKey: ["tours-search", debouncedSearch],
    queryFn: () => fetchAllSearchTours(debouncedSearch),
    enabled: Boolean(debouncedSearch),
  });

  const removeSearchQuery = () => setSearchQuery("");

  return (
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
      <Button className="text-white h-[40px]">
        <Search className="size-4" />
        Search
      </Button>

      {/* Search result */}
      {searchQuery && (
        <div className="absolute top-16 max-w-[646px] w-full bg-white p-2 rounded-lg flex flex-col border border-muted shadow-md">
          <p className="text-xs text-center mb-2 font-medium text-primary">Search result</p>
          {isLoading && <p className="">Searching tour...</p>}
          {data?.result && data.result.length <= 0 && <p className="p-3 text-center text-sm rounded-md bg-gray-100">Not found tours</p>}
          {data?.result && data.result.length > 0 && (
            <ScrollArea className="max-h-80 w-full">
              <div className="space-y-1 w-full">
                {data?.success && data.result?.map((tour) => (
                  <Link to={`/tours/${tour._id}`} prefetch="intent">
                    <div className="bg-white hover:bg-gray-100 p-3 rounded-md flex items-center gap-3">
                      <div className="w-14 h-10 rounded-md overflow-hidden">
                        <img src={tour?.imageUrls[0]} alt={tour.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col items-start gap-0 flex-1">
                        <h5 className="font-medium text-sm text-primary line-clamp-1">{tour?.title}</h5>
                        <span className="font-normal text-xs text-gray-400">{tour?.destination}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default TourSearchBox;
