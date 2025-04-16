import InfiniteScrollContainer from "@/components/post/infinite-scroll-container";
import NewPost from "@/components/post/new-post";
import PostCard from "@/components/post/post-card";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import ToursRecommend from "@/components/tour/tours-recommend";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import { useAppSelector } from "@/hooks/redux";
import useGetBusyDates from "@/hooks/useGetBusyDates";
import { fetchPostByUsername } from "@/services/posts/post-api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";

type OutletContext = {
  userId: string;
  role: "TOUR_GUIDE" | "TRAVELER";
}

const UserProfilePage = () => {
  const { username } = useParams();
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { userId, role } = useOutletContext<OutletContext>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts-feed", "user-posts", username],
    queryFn: ({ pageParam }) => fetchPostByUsername({ username: username!, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  const posts = data?.pages.flatMap((page) => page.data) || []; 

  const { data: calendarData } = useGetBusyDates(userId);

  const statusMap = useMemo(() => {
    const map = new Map<string, "BOOKED" | "UNAVAILABLE" | "AVAILABLE">();
    calendarData?.dates.forEach((item) => {
      const formattedDate = format(new Date(item.date), "yyyy-MM-dd");
      map.set(formattedDate, item.status);
    });
    return map;
  }, [calendarData]);

  return (
    <div className="my-1 w-full flex items-start gap-5">
      {/* left content */}
      {role === "TOUR_GUIDE" && (
        <div className="flex flex-col gap-1 max-w-[320px] sticky top-20 left-0">
          <div className="flex justify-between px-3">
            <p className="font-medium pt-2 text-primary">Schedule</p>
            <Button variant="link" className="text-primary pr-1">
              <Link to="/busy-schedule">
                Edit
              </Link>
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className={"border rounded-t-xl bg-white"}
            modifiers={{
              booked: (day) =>
                statusMap.get(format(day, "yyyy-MM-dd")) === "BOOKED",
              busy: (day) =>
                statusMap.get(format(day, "yyyy-MM-dd")) === "UNAVAILABLE",
            }}
            modifiersClassNames={{
              booked: "bg-green-100",
              busy: "bg-slate-200",
            }}
          />
          <div className="flex gap-2 p-3 justify-between bg-white -mt-1 rounded-b-xl border-x border-b">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-lg border mr-2 bg-green-100" />
              <span className="text-sm" >Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-lg border mr-2 bg-slate-200" />
              <span className="text-sm">Busy</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-lg border mr-2" />
              <span className="text-sm">Empty</span>
            </div>
          </div>
        </div>
      )}
      {/* main content */}
      <div className="flex-1">
        {isAuthenticated && userInfo?.username === username && (
          <NewPost />
        )}
        <InfiniteScrollContainer
          className="flex flex-col gap-3"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {status === "pending" && <PostCardSkeleton />}
          {status === "error" && <p className="text-center text-destructive">An error occurred while loading posts.</p>}
          {posts.map((post) => (
            <PostCard key={post._id} postData={post} />
          ))}
          {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
        </InfiniteScrollContainer>
      </div>
      {/* right content */}
      <div className="flex flex-col gap-5 max-w-[340px] w-full sticky top-20 left-0">
        {/* tour recommend */}
        <ToursRecommend />
      </div>
    </div>
  )
}

export default UserProfilePage