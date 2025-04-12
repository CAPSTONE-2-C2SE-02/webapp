import { cn } from "@/lib/utils";
import { Link } from "react-router";

interface TopUserRankingProps {
  tourGuide: {
    profilePicture: string;
    username: string;
    fullName: string;
  },
  totalScore: number;
  styles: {
    avatar: string;
    color: string;
  },
  rank: number;
}

const TopUserRanking = ({ tourGuide, totalScore, styles, rank }: TopUserRankingProps) => {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("text-base font-semibold text-white size-6 flex items-center justify-center rounded-md", styles.color)}>
        {rank}
      </div>
      <div className={cn("rounded-full border border-slate-200 overflow-hidden", styles.avatar)}>
        <img src={tourGuide?.profilePicture} alt="img" className="w-full h-full object-cover" />
      </div>
      <Link to={`/${tourGuide?.username}`} className="text-primary text-sm font-semibold leading-none hover:underline">
        {tourGuide?.fullName}
      </Link>
      <span className="text-primary text-xs font-semibold leading-none bg-slate-200 px-1.5 py-1 rounded">
        {totalScore?.toFixed(1)}
      </span>
    </div>
  );
};

export default TopUserRanking;
