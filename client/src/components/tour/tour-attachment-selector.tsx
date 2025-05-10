import { ArrowLeft, Loader2, MapPin, Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
// import { tours } from "@/lib/mock-data";
import { Tour } from "@/lib/types";
import useDebounce from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPostTourGuide } from "@/services/tours/tour-api";

interface TourAttachmentSelectorProps {
  isShow: boolean;
  onBack: () => void;
  onSelect: (tour: Tour) => void
}

const TourAttachmentSelector = ({ isShow, onBack, onSelect }: TourAttachmentSelectorProps) => {
  const { data: tours, isLoading, isError, error } = useQuery({
    queryKey: ["tours", "tours-author"],
    queryFn: fetchAllPostTourGuide,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");

  // debounced search
  const debouncedSearch = useDebounce(searchQuery, 500);

  const filteredTours = useMemo(() => {
    if (!tours || !isShow) return [];
    return tours?.result?.filter(
      (tour) =>
        tour.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tour?.destination.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tour?.introduction.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [debouncedSearch, isShow, tours]);

  const handleSelectTour = (tour: Tour) => {
    onBack();
    onSelect(tour)
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center">
        <Button onClick={onBack} variant={"ghost"} size={"icon"}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold text-primary text-center flex-1 mr-5">Select a tour</h3>
      </div>

      {/* search box */}
      <div className="relative mb-4 px-1">
        <Input
          className="pl-10 pr-10 py-2 w-full bg-gray-100 border-0 outline-none"
          placeholder="Search tour"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        {searchQuery && (
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setSearchQuery("")}>
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
      
      {/* tours list */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-220px)] h-full">
        {isLoading && (
          <div className="border-b py-3 px-3 cursor-pointer flex items-center justify-center">
            <Loader2 className="animate-spin size-4" />
          </div>
        )}
        {isError && (
          <div className="border-b py-3 px-3 cursor-pointer flex items-center justify-center text-red-400">
            <span>An error occurred while loading tours.</span>
            <span>{error.message}</span>
          </div>
        )}
        {filteredTours?.map((tour) => (
          <div key={tour._id} className="border-b py-3 px-3 cursor-pointer" onClick={() => handleSelectTour(tour)}>
            <h3 className="font-semibold text-primary">{tour.title}</h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {tour.destination}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

export default TourAttachmentSelector