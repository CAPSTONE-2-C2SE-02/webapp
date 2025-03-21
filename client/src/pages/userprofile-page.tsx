import NewPost from "@/components/post/new-post";
import PostCard from "@/components/post/post-card";
import ToursRecommend from "@/components/tour/tours-recommend";
import { Calendar } from "@/components/ui/calendar"
import { useAppSelector } from "@/hooks/redux";
import { useState } from "react";
import { useParams } from "react-router";

const UserProfilePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
  const { username } = useParams();
  
  return (
    <div className="my-1 w-full flex items-start gap-5">
      {/* left content */}
      <div className="flex flex-col gap-5 max-w-[320px] sticky top-24 left-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className={"border rounded-xl bg-primary text-white"}
        />
      </div>
      {/* main content */}
      <div className="flex-1">
        {isAuthenticated && userInfo?.username === username && (
          <NewPost />
        )}
        <div className="flex flex-col gap-3">
          <PostCard />
          <PostCard />
          <PostCard />
        </div>
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