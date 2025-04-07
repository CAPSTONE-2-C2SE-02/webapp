import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router";

const RankingItem = () => {
  return (
    <Link
      to="/user"
      className="flex items-center justify-between p-3 pl-5 w-full bg-white rounded hover:bg-slate-500 group transition-colors duration-200"
    >
      <div className="text-base space-x-4 text-primary group-hover:text-white transition-colors duration-200">
        <span className="font-black">1</span>
        <span className="pl-3 border-l-4 border-emerald-400 font-black">
          Dang Khoa
        </span>
        <span className="text-gray-400 text-sm group-hover:text-white transition-colors duration-200">
          Da Nang
        </span>
      </div>
      <div className="flex items-center gap-2 text-primary">
        <div className="px-3 py-1 rounded-full bg-gray-200">
          <span className="text-xs font-semibold">12 Point</span>
        </div>
        <ChevronRightIcon className="size-5 group-hover:text-white transition-colors duration-200" />
      </div>
    </Link>
  );
};

export default RankingItem;
