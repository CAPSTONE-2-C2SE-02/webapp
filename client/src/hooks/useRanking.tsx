import { getAuthRanking, getRanking, getRankingType, RankingType } from "@/services/ranking-service";
import { useQuery } from "@tanstack/react-query";

export function useRankingTop(limit = 10) {
  return useQuery({
    queryKey: ["rankings", limit],
    queryFn: () => getRanking({ limit }),
    select: (data) => data?.result,
    staleTime: 1000 * 60 * 5,
  });
};

export function useRankingType({ type, limit }: RankingType) {
  return useQuery({
    queryKey: ["rankings", type],
    queryFn: () => getRankingType({ type, limit }),
    staleTime: 1000 * 60 * 5,
  });
};

export function useMyRank() {
  return useQuery({
    queryKey: ["my-rank"],
    queryFn: getAuthRanking,
  });
};