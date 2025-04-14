import InfiniteScrollContainer from "@/components/post/infinite-scroll-container";
import NewPost from "@/components/post/new-post";
import PostCard from "@/components/post/post-card";
import PostCardSkeleton from "@/components/skeleton/post-card-skeleton";
import ToursRecommend from "@/components/tour/tours-recommend";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import { useAppSelector } from "@/hooks/redux";
import { fetchPostByUsername } from "@/services/posts/post-api";
import { getBusyDates } from "@/services/users/user-api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

const UserProfilePage = () => {
  const { username } = useParams();
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const selectedMonth = useMemo(() => date?.getMonth()! + 1, [date]);
  const selectedYear = useMemo(() => date?.getFullYear()!, [date]);
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

  const { data: calendarData } = useQuery({
    queryKey: ["user-calendar", username, selectedMonth, selectedYear],
    queryFn: async () => getBusyDates(userInfo?._id as string),
    enabled: !!username,
  });

  const statusMap = useMemo(() => {
    const map = new Map<string, "BOOKED" | "UNAVAILABLE" | "AVAILABLE">();
    calendarData?.dates.forEach((item: any) => {
      const formattedDate = format(new Date(item.date), "yyyy-MM-dd");
      map.set(formattedDate, item.status);
    });
    return map;
  }, [calendarData]);

  const formatDate = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  return (
    <div className="my-1 w-full flex items-start gap-5">
      {/* left content */}
      {userInfo?.role === "TOUR_GUIDE" && (
      <div className="flex flex-col gap-1 max-w-[320px] sticky top-24 left-0">
        <div className="flex justify-between">
          <p className="font-medium pt-2">Schedule</p>
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
              statusMap.get(formatDate(day)) === "BOOKED",
            busy: (day) =>
              statusMap.get(formatDate(day)) === "UNAVAILABLE",
          }}
          modifiersClassNames={{
            booked: "bg-green-100",
            busy: "bg-slate-200",
          }}
        />
        <div className="">
            <div className="flex gap-2 p-3 justify-between bg-white -mt-1 rounded-b-xl border-x border-b">
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded-lg border mr-2 bg-green-100 "></div>
                    <span className="text-sm" >Booked</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded-lg border mr-2 bg-slate-200 flex ">
                    </div>
                    <span className="text-sm">Busy</span>
                </div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 rounded-lg border mr-2 flex">
                        </div>
                        <span className="text-sm">Empty</span>
                    </div>
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