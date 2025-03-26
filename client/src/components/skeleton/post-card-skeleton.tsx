import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const PostCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            {/* Username skeleton */}
            <Skeleton className="h-4 w-24" />
            {/* Timestamp skeleton */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Action buttons skeleton */}
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {/* Text content skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Hashtag skeleton */}
          <div className="flex items-center gap-1 mt-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Image skeleton */}
        <div className="mt-3">
          <Skeleton className="h-52 w-full" />
        </div>

        {/* Tour attachment skeleton */}
        <Skeleton className="h-28 w-full mt-3 rounded-lg" />

        {/* Post action skeleton */}
        <div className="w-full flex items-center justify-between px-10 mt-3">
          {/* Like button skeleton */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-6 w-8 rounded-xl" />
          </div>

          {/* Comment button skeleton */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-8 rounded-xl" />
          </div>

          {/* Share button skeleton */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-8 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCardSkeleton;
