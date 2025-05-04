import { Link } from "react-router";
import { getTopHashtags } from "@/services/posts/post-api";
import { useQuery } from "@tanstack/react-query";

const TrendingTopics = () => {
  const { data } = useQuery({
    queryKey: ["hashtags"],
    queryFn: getTopHashtags,
    staleTime: Infinity,
  });
  return (
    <div className="border-border w-full px-5 py-4 rounded-xl bg-white">
      <div className="font-semibold text-base text-primary mb-4">
        Trending Topics
      </div>
      {/* tags list */}
      <div className="flex flex-wrap items-start gap-1.5">
        {data?.map((tag) => (
          <Link to={`/hashtag/${tag.hashtag}`} key={tag.hashtag}>
            <div className="flex items-center gap-1.5 px-2 py-1 pr-1.5 bg-slate-50 rounded-2xl border-[0.5px] border-slate-300">
              <span className="text-xs text-primary font-medium">#{tag.hashtag}</span>
              <div className="text-[10px] bg-white text-teal-600 px-1.5 py-0.5 rounded-full border-[0.5px] border-slate-300">
                {tag.count}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
