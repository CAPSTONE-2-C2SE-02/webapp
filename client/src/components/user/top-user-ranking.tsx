import avatar from "@/assets/avatar-demo.jpg";
import { cn } from "@/lib/utils";
import { TourGuideRank } from "./tourguides-ranking";
import { Link } from "react-router";

const rankingStyles = {
  1: {
    avatar: "size-14",
    color: "bg-teal-500",
  },
  2: {
    avatar: "size-12",
    color: "bg-cyan-600",
  },
  3: {
    avatar: "size-10",
    color: "bg-primary",
  }
}

const TopUserRanking = ({ tourGuide }: { tourGuide: TourGuideRank }) => {
  const styles = rankingStyles[tourGuide.ranking as keyof typeof rankingStyles]

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("text-base font-semibold text-white size-6 flex items-center justify-center rounded-md", styles.color)}>
        {tourGuide.ranking}
      </div>
      <div className={cn("rounded-full border border-slate-200 overflow-hidden", styles.avatar)}>
        <img src={avatar} alt="img" className="w-full h-full object-cover" />
      </div>
      <Link to={`/thanhthao12`} className="text-primary text-sm font-semibold leading-none hover:underline">
        {tourGuide.name}
      </Link>
      <span className="text-primary text-xs font-semibold leading-none bg-slate-200 px-1.5 py-1 rounded">
        {tourGuide.totalScore.toFixed(1)}
      </span>
    </div>
  );
};

export default TopUserRanking;
