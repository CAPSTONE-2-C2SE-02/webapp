import { useEffect, useMemo } from "react";
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

  const reorderedTopGuides = useMemo(() => {
    if (topThreeRank) {
      return [
        topThreeRank[1], // 2nd place
        topThreeRank[0], // 1st place
        topThreeRank[2], // 3rd place
      ]
    } else {
      return [];
    }
  }, [topThreeRank]);
  
  return (
    <div className="relative">
      <Link to={"/ranking"} title="Tour Guide's Ranking">
        <div className="absolute top-0 w-[160px] pb-2 pr-2 bg-slate-100 flex items-center justify-center rounded-br-3xl z-10 after:w-5 after:h-5 after:content-[''] after:absolute after:left-0 after:top-12 after:rounded-tl-xl after:shadow-[-0.375rem_-0.375rem] after:shadow-slate-100 after:bg-transparent before:w-5 before:h-5 before:content-[''] before:absolute before:left-[160px] before:top-0 before:rounded-tl-xl before:shadow-[-0.375rem_-0.375rem] before:shadow-slate-100 before:bg-transparent">
          <p className="w-full rounded-full text-center py-2 text-white bg-primary text-base font-semibold">Ranking</p>
        </div>
      </Link>
      <div className="w-full relative bg-white rounded-xl pt-14 pb-4">
        <div className="w-[calc((100%/2)-8px)] py-1 absolute top-2 right-2 bg-slate-100 rounded-lg">
          <p className="text-base w-full text-primary font-semibold text-center">Tour Guides</p>
        </div>
        <div className="flex items-end justify-center gap-6 px-5">
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
    </div>
  )
}

export default TourguidesRanking