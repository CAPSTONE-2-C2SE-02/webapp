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

  return (
    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-sm font-medium ml-3">Result: 23 Properties Found</h2>
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
          <Select defaultValue="popular">
            <SelectTrigger className="w-[180px]">
              <span className="text-sm">Sort by:</span>
              <SelectValue placeholder="Popular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="price-low">Low to High</SelectItem>
              <SelectItem value="price-high">High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
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
      <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-3"}>
        {tours.map((tour) => (
          <TourCard key={tour._id} tour={tour} type={viewType} />
        ))}
      </div>
      {/* Pagination */}
      {total > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            
            {getPaginationItems()}

            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TourListing;
