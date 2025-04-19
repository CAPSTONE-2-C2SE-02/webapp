import TourFilterPanel from "@/components/tour/tour-filter-panel";
import TourListing from "@/components/tour/tour-listings";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAllTours } from "@/services/tours/tour-api";
import TourSearchBox from "@/components/tour/tour-search-box";
import { PlusIcon } from "lucide-react";
import useAuthInfo from "@/hooks/useAuth";

const ToursPage = () => {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries([...searchParams]);
  const auth = useAuthInfo();
  
  const page = params.page ? parseInt(params.page) : 1;
  const sortBy = (params.sortBy || "createdAt") as | "price" | "rating" | "createdAt";
  const sortOrder = (params.sortOrder || "desc") as "asc" | "desc";
  
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["tours", page, sortBy, sortOrder],
    queryFn: () => fetchAllTours({ pageParam: page, sortBy, sortOrder }),
    placeholderData: keepPreviousData,
  });

  const tours = data?.success && data.result ? data.result.data : [];
  const total = data?.success && data.result ? data.result.totalPage : 0;

  return (
    <div className="my-5">
      <div className="mb-14">
        <div className="w-full max-h-[320px] h-full rounded-[20px] relative">
          {/* banner */}
          <div className="w-full h-[320px] rounded-[20px] overflow-hidden border-[5px] border-white relative flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="w-full h-full object-cover" />
            <div className="absolute top-1/4 text-5xl font-madimi text-primary font-bold leading-tight bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm">
              <h1 className="tracking-wider">Live You <span className="text-[hsla(63,69%,85%,1)]">ADVENTURE</span></h1>
              <h1 className="tracking-wider">Travel and Enjoy you <span className="text-white">Life !</span></h1>
            </div>
          </div>
          {/* search box */}
          <TourSearchBox />
        </div>
      </div>
      {/* main part */}
      <div className="flex items-start flex-col lg:flex-row gap-5">
        {/* Filter Sidebar */}
        <div className="bg-white px-2 py-3 max-w-80 rounded-xl border border-slate-200 shadow-sm space-y-2 items-center sticky left-0 top-[88px]">
          <div className="flex items-center justify-between mx-5">
            <h5 className="text-sm">Filter</h5>
            <Button size={"sm"} variant={"ghost"}>Reset Filter</Button>
          </div>
          {/* Cards Feature */}
          <TourFilterPanel />
        </div>
        {isError && (
          <div className="w-full shadow bg-white rounded-2xl border border-zinc-50 p-5 text-sm text-red-500 font-medium">
            {error.message}
          </div>
        )}
        {/* Tour Listings */}
        <TourListing
          tours={tours}
          total={total}
          currentPage={page}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          loading={isPending}
        />
      </div>
      {auth?.role === "TOUR_GUIDE" && (
        <Button className="fixed bottom-8 right-8 rounded-full transition-all duration-300 overflow-hidden w-10 h-10 hover:w-[152px] group z-30" asChild>
          <Link to={"/tours/create"}>
            <PlusIcon className="z-10 absolute left-3" />
            <span className="origin-right absolute right-5 translate-x-10 opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:delay-75 group-hover:visible group-hover:translate-x-0">Create new tour</span>
          </Link>
        </Button>
      )}
    </div>
  )
};

export default ToursPage;