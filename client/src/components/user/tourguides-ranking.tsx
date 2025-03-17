import { useMemo } from "react";
import TopUserRanking from "./top-user-ranking";
import { cn } from "@/lib/utils";

export type TourGuideRank = {
  _id: string;
  name: string;
  postRank: number;
  reviewRank: number;
  bookingRank: number;
  totalScore: string;
  ranking: number;
};

const TOUR_GUIDE_DATA: TourGuideRank[] = [
  {
    _id: "1",
    name: "John Smith",
    postRank: 9,
    reviewRank: 10,
    bookingRank: 9,
    totalScore: "98.5",
    ranking: 1
  },
  {
    _id: "2",
    name: "Emma Davis",
    postRank: 8,
    reviewRank: 9,
    bookingRank: 9,
    totalScore: "95.2",
    ranking: 2
  },
  {
    _id: "3",
    name: "Liam Brown",
    postRank: 8,
    reviewRank: 8,
    bookingRank: 9,
    totalScore: "91.8",
    ranking: 3
  },
  {
    _id: "4",
    name: "Olivia Wilson",
    postRank: 7,
    reviewRank: 8,
    bookingRank: 8,
    totalScore: "87.6",
    ranking: 4
  },
  {
    _id: "5",
    name: "Noah Taylor",
    postRank: 7,
    reviewRank: 7,
    bookingRank: 8,
    totalScore: "84.3",
    ranking: 5
  },
  {
    _id: "6",
    name: "Ava Anderson",
    postRank: 6,
    reviewRank: 7,
    bookingRank: 7,
    totalScore: "79.1",
    ranking: 6
  },
  {
    _id: "7",
    name: "James Thomas",
    postRank: 6,
    reviewRank: 6,
    bookingRank: 7,
    totalScore: "76.8",
    ranking: 7
  },
  {
    _id: "8",
    name: "Sophia Martinez",
    postRank: 5,
    reviewRank: 6,
    bookingRank: 6,
    totalScore: "72.4",
    ranking: 8
  },
  {
    _id: "9",
    name: "Benjamin White",
    postRank: 5,
    reviewRank: 5,
    bookingRank: 6,
    totalScore: "68.9",
    ranking: 9
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
      <div className="absolute top-0 w-[160px] pb-2 pr-2 bg-slate-100 flex items-center justify-center rounded-br-3xl z-10 after:w-5 after:h-5 after:content-[''] after:absolute after:left-0 after:top-12 after:rounded-tl-xl after:shadow-[-0.375rem_-0.375rem] after:shadow-slate-100 after:bg-transparent before:w-5 before:h-5 before:content-[''] before:absolute before:left-[160px] before:top-0 before:rounded-tl-xl before:shadow-[-0.375rem_-0.375rem] before:shadow-slate-100 before:bg-transparent">
        <p className="w-full rounded-full text-center py-2 text-white bg-primary text-base font-semibold">Ranking</p>
      </div>
      <div className="w-full relative bg-white rounded-xl mb-[10px] pt-16 pb-3">
        <div className="w-[calc(100%/2)] absolute top-2 right-0">
          <p className="text-base w-full text-primary font-semibold text-center">Tourguides</p>
        </div>
        <div className="flex items-end justify-center gap-6 px-8">
          {/* Top 3 tourguide */}
          {reorderedTopGuides.map((item) => (
            <TopUserRanking tourGuide={item} key={item._id} />
          ))}
        </div>
        {/* Table for other tourguide */}
        <table className="w-full text-left mt-2">
          <thead className="text-zinc-500 text-xs">
            <tr>
              <th></th>
              <th className="px-2 py-2 font-normal">Booked</th>
              <th className="px-2 py-2 font-normal">Response</th>
              <th className="px-2 py-2 font-normal">Posts</th>
            </tr>
          </thead>
          <tbody>
            {TOUR_GUIDE_DATA.slice(3).map((rank, index) => (
              <tr key={rank._id} className={cn("text-sm text-primary", index % 2 === 0 ? "bg-slate-50" : "bg-white")}>
                <td className="flex items-center px-4 py-2 space-x-2">
                  <span className="bg-primary text-white px-2.5 py-1 rounded-lg text-sm font-bold">{rank.ranking}</span>
                  <img src="https://images.unsplash.com/profile-1441298803695-accd94000cac?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=64&w=64&s=5a9dc749c43ce5bd60870b129a40902f" alt="" className="rounded-full size-[26px]" />
                  <span className="text-xs font-semibold text-primary line-clamp-1">{rank.name}</span>
                </td>
                <td className="px-2 py-2 text-center">{rank.postRank}</td>
                <td className="px-2 py-2 text-center">{rank.reviewRank}</td>
                <td className="px-2 py-2 text-center">{rank.bookingRank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TourguidesRanking