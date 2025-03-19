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
import { tours } from "@/lib/mock-data";
import TourCard from "./tour-card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

const TourListing = () => {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
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
            variant="outline"
            size="icon"
            className={viewType === "grid" ? "bg-primary text-white" : ""}
            onClick={() => setViewType("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={viewType === "list" ? "bg-primary text-white" : ""}
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
      <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-6"}>
        {tours.map((tour) => (
          <TourCard key={tour._id} tour={tour} type={viewType} />
        ))}
      </div>
      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default TourListing;
