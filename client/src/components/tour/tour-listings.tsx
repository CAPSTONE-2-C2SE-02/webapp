import { useState } from "react";
import { Button } from "../ui/button";
import { Filter, Grid, List, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import TourCard from "./tour-card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { Tour } from "@/lib/types";
import TourCardSkeleton from "../skeleton/tour-card-skeleton";
import { useSearchParams } from "react-router";

interface TourListing {
  tours: Tour[];
  total: number;
  currentPage: number;
  currentSortBy: string;
  currentSortOrder: string;
  loading: boolean;
}

const TourListing = ({
  tours,
  total,
  currentPage,
  currentSortBy,
  currentSortOrder,
  loading,
}: TourListing) => {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchParams, setSearchParams] = useSearchParams();

  const basePath =
    typeof window !== "undefined" ? window.location.pathname : "/tours";

  const getPaginationItems = () => {
    const items = [];

    items.push(
      <PaginationItem key={"first"}>
        <PaginationLink
          href={`${basePath}?page=1${
            currentSortBy
              ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
              : ""
          }`}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )

    if (currentPage > 3) {
      items.push(
        <PaginationItem key={"elipsis-1"}>
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(total - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === total) continue;

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href={`${basePath}?page=${i}${
              currentSortBy
                ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
                : ""
            }`}
            isActive={currentPage  === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      ); 
    }

    if (currentPage < total - 2) {
      items.push(
        <PaginationItem key={`eclipsis-2`}>
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    if (total > 1) {
      items.push(
        <PaginationItem key={"last"}>
          <PaginationLink
            href={`${basePath}?page=${total}${
              currentSortBy
                ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
                : ""
            }`}
            isActive={currentPage === total}
          >
            {total}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items;
  }

  const handleSortTours = (value: string) => {
    if (value.includes("price")) {
      const sortPrice = value.split("-");
      searchParams.set("sortBy", sortPrice[0]);
      searchParams.set("sortOrder", sortPrice[1]);
    } else {
      searchParams.set("sortBy", value);
      searchParams.set("sortOrder", "desc");
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-sm font-medium ml-3">Result: {tours.length} Properties Found</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-primary text-white"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewType("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewType("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MapPin className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm">Sort by:</span>
            <Select defaultValue="createdAt" onValueChange={handleSortTours}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Latest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Latest</SelectItem>
                <SelectItem value="slot">Slot</SelectItem>
                <SelectItem value="price-asc">Price (low to high)</SelectItem>
                <SelectItem value="price-desc">Price (high to low)</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Tour Cards */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
        </div>
      )}
      <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-3"}>
        {tours.map((tour) => (
          <TourCard key={tour._id} tour={tour} type={viewType} />
        ))}
      </div>
      {/* Pagination */}
      {total > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href={`${basePath}?page=${Math.max(1, currentPage - 1)}${
                  currentSortBy
                    ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
                    : ""
                }`}
              />
            </PaginationItem>
            
            {getPaginationItems()}

            <PaginationItem>
              <PaginationNext
                href={`${basePath}?page=${Math.min(total, currentPage + 1)}${
                  currentSortBy
                    ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
                    : ""
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TourListing;
