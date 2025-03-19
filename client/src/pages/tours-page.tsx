import TourFilterPanel from "@/components/tour/tour-filter-panel";
import TourListing from "@/components/tour/tour-listings";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";

const ToursPage = () => {
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
          <div className="absolute max-w-[800px] w-full left-1/2 bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-border -translate-x-1/2 bottom-0 translate-y-1/3 flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-white flex items-center justify-center gap-4 border border-border flex-1">
              <MapPin className="size-4" />
              <input type="text" className="border-none outline-none flex-1 text-base placeholder:text-base" placeholder="Xin chao cac con vo" />
            </div>
            <Button className="text-white h-[40px]">
              <Search className="size-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
      {/* main part */}
      <div className="flex items-start flex-col lg:flex-row gap-5">
        {/* Filter Sidebar */}
        <div className="bg-white px-2 py-3 max-w-80 rounded-xl border border-slate-200 shadow-sm space-y-2 items-center">
          <div className="flex items-center justify-between mx-5">
            <h5 className="text-sm">Filter</h5>
            <Button size={"sm"} variant={"ghost"}>Reset Filter</Button>
          </div>
          {/* Cards Feature */}
          <TourFilterPanel />
        </div>
        {/* Tour Listings */}
        <TourListing />
      </div>
    </div>
  )
};

export default ToursPage;