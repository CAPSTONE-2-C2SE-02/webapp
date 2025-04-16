import { Skeleton } from "../ui/skeleton";

const TourCardSkeleton = () => {
  return (
    <div className="p-2 flex flex-col shadow bg-white rounded-2xl group transition-all duration-300 hover:shadow-lg border border-zinc-50">
      {/* image */}
      <div className="w-full h-[200px] rounded-lg overflow-hidden relative transition-all duration-300 group-hover:h-[calc(200px-36px)]">
        <Skeleton className="w-full h-full" />
      </div>

      {/* content */}
      <div className="p-2 flex flex-col items-center gap-5 flex-1 transition-opacity duration-300 group-hover:opacity-100 relative">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-10" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-2.5 w-10" />
          <Skeleton className="h-2.5 w-10" />
        </div>
      </div>
    </div>
  )
}

export default TourCardSkeleton