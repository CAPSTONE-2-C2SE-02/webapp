import { useMemo } from "react";
import TopUserRanking from "./top-user-ranking";
import { Link } from "react-router";

export type TourGuideRank = {
  _id: string;
  name: string;
  postRank: number;
  reviewRank: number;
  bookingRank: number;
  totalScore: number;
  ranking: number;
};

const TOUR_GUIDE_DATA: TourGuideRank[] = [
  {
    _id: "1",
    name: "John Smith",
    postRank: 9,
    reviewRank: 10,
    bookingRank: 9,
    totalScore: 98.5,
    ranking: 1
  },
  {
    _id: "2",
    name: "Emma Davis",
    postRank: 8,
    reviewRank: 9,
    bookingRank: 9,
    totalScore: 95.2,
    ranking: 2
  },
  {
    _id: "3",
    name: "Liam Brown",
    postRank: 8,
    reviewRank: 8,
    bookingRank: 9,
    totalScore: 91.8,
    ranking: 3
  },
];

const TourguidesRanking = () => {
  const reorderedTopGuides = useMemo(() => {
    const topThree = TOUR_GUIDE_DATA.slice(0, 3);
    return [
      topThree[1], // 2nd place
      topThree[0], // 1st place
      topThree[2], // 3rd place
    ]
  }, []);
  
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
        <div className="flex items-end justify-center gap-6 px-8">
          {/* Top 3 tourguide */}
          {reorderedTopGuides.map((item) => (
            <TopUserRanking tourGuide={item} key={item._id} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TourguidesRanking