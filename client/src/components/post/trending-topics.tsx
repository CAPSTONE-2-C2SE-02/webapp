import { Link } from "react-router";
import { hashtagsMockData } from "@/lib/mock-data";

const TrendingTopics = () => {
  return (
    <div className="border-border w-full px-5 py-4 rounded-xl bg-white">
      <div className="font-semibold text-base text-primary mb-4">
        Trending Topics
      </div>
      {/* tags list */}
      <div className="flex flex-wrap items-start gap-1.5">
        {hashtagsMockData.map((tag) => (
          <Link to={`/hashtag/${tag.name}`} key={tag.name}>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded border-[0.5px] border-slate-300">
              <span className="text-xs text-primary font-medium">#{tag.name}</span>
              <div className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded-full border-[0.5px] border-slate-300">
                {tag.numberOfPost}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
