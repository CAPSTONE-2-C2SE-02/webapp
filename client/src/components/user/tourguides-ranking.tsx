import { useEffect } from "react";
import TopUserRanking from "./top-user-ranking";
import { Link } from "react-router";
import { useRankingTop } from "@/hooks/useRanking";
import { toast } from "sonner";

const rankingStyles = [
  {
    avatar: "size-12",
    color: "bg-cyan-600",
  },
  {
    avatar: "size-14",
    color: "bg-teal-500",
  },
  {
    avatar: "size-10",
    color: "bg-primary",
  }
]

const TourguidesRanking = () => {
  const { data: topThreeRank, isError, isSuccess } = useRankingTop(3);

  useEffect(() => {
    if (isError) {
      toast.error("Error went loading ranking");
    }
  }, [isError]);

  const reorderedTopGuides = topThreeRank ? [ topThreeRank[1], topThreeRank[0], topThreeRank[2] ] : [];
  
  return (
    <div className="w-full bg-white rounded-xl p-5 border">
      <Link to={"/ranking"}>
      <h1 className="text-base py-1 px-4 rounded-lg bg-primary text-white font-bold text-center mb-5 w-fit mx-auto shadow-[5px_5px_oklch(70.4%_0.14_182.503)]">Tour Guides Ranking</h1>
      </Link>
      <div className="flex items-end justify-center gap-6">
        {isError && <p className="text-center bg-slate-200 py-2 rounded-md text-red-500 font-medium">Error Loading Ranking</p>}
        {/* Top 3 tourguide */}
        {isSuccess && topThreeRank && reorderedTopGuides.map((item, index) => {
          const rankOrder = [2, 1, 3];
          return (
            <TopUserRanking 
              key={item?._id}
              tourGuide={item?.tourGuideId}
              totalScore={item?.totalScore}
              rank={rankOrder[index]}
              styles={rankingStyles[index]}
            />
          )
        })}
      </div>
    </div>
  )
}

export default TourguidesRanking