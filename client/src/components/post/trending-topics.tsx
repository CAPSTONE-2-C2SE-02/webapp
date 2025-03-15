import { Link } from "react-router";

const hashtagsMockData = [
  {
    name: "banahill",
    numberOfPost: 43,
  },
  {
    name: "danang",
    numberOfPost: 34,
  },
  {
    name: "hoian",
    numberOfPost: 25,
  },
  {
    name: "hanoi",
    numberOfPost: 22,
  },
  {
    name: "hagiang",
    numberOfPost: 20,
  },
  {
    name: "caobang",
    numberOfPost: 15,
  },
  {
    name: "hochiminh",
    numberOfPost: 12,
  },
  {
    name: "vungtau",
    numberOfPost: 6,
  },
  {
    name: "khanhhoa",
    numberOfPost: 3,
  },
];

const TrendingTopics = () => {
  return (
    <div className="border-border w-full px-5 py-4 rounded-xl bg-white">
      <div className="font-semibold text-base text-primary mb-5">
        Trending Topics
      </div>
      {/* tags list */}
      <div className="flex flex-wrap items-start gap-1.5">
        {hashtagsMockData.map((tag) => (
          <Link to={`/posts&hashtag=${tag.name}`} key={tag.name}>
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 rounded border-[0.5px] border-slate-300">
              <span className="text-sm text-primary">#{tag.name}</span>
              <div className="text-xs text-zinc-400 px-2 py-0.5 rounded-full border-[0.5px] border-slate-300">
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
