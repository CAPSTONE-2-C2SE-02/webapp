import RankingItem from "@/components/user/ranking-item";
import TopRanking from "@/components/user/top-ranking";
import { useRankingTop } from "@/hooks/useRanking";

const RankingPage = () => {
  const { data: tourGuides, isError, isSuccess } = useRankingTop(10);

  return (
    <div className="w-full max-w-lg md:max-w-4xl mx-auto my-10">
      <div className="space-y-6">
        <h1 className="text-3xl text-primary font-extrabold text-center bg-white rounded-lg p-3 px-8 border-2 border-teal-600 shadow-[5px_5px_oklch(70.4%_0.14_182.503)] w-fit mx-auto">
          <span className="text-cyan-600">TOUR GUIDES</span> RANKING
        </h1>
        <div className="w-full pt-10 space-y-4">
          {isError && (
            <p className="text-center text-red-400">
              ⚠️ Failed to load rankings. Please try again.
            </p>
          )}
          {isSuccess && tourGuides && (
            <div className="grid grid-cols-1 md:grid-cols-[5fr_6fr_5fr] items-end gap-4">
              {[1, 0, 2].map((customIndex) => {
                const guide = tourGuides[customIndex];
                if (!guide) return null;
                return (
                  <TopRanking
                    key={guide._id}
                    tourGuide={guide?.tourGuideId}
                    rank={customIndex + 1}
                    point={guide?.totalScore}
                  />
                );
              })}
            </div>
          )}
          <ul className="flex flex-col gap-[1px]">
            {isSuccess &&
              tourGuides &&
              tourGuides.slice(3).map((guide, index) => (
                <li key={guide._id}>
                  <RankingItem
                    tourGuide={guide.tourGuideId}
                    rank={index + 4}
                    point={guide.totalScore}
                  />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
