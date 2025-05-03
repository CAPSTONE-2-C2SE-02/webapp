import { Skeleton } from "@/components/ui/skeleton"

const TourRecommendCardSkeleton = () => {
  return (
    <div className="bg-white relative rounded-[20px] p-2 border-border">
      <Skeleton className="rounded-xl h-[120px] w-full" />
      <div className="px-1 pb-1 pt-2 w-full flex items-center gap-1">
        <div>
          <Skeleton className="h-5 mb-1 w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  )
}

export default TourRecommendCardSkeleton