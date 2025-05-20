import { Tour } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_RECOMMEND_URL =
  import.meta.env.VITE_RECOMMENDATION_API_URL ||
  "http://localhost:8020";

interface ToursRecommendationResponse {
  tours: {
    score: number;
    tour: Tour;
  }[];
  userId?: string;
}

export const getRecommendations = async ({
  userId,
  limit,
}: {
  userId?: string;
  limit?: number;
}): Promise<ToursRecommendationResponse> => {
  const response = await axios.get(`${API_RECOMMEND_URL}/tours-recommendation`, {
      params: {
        user_id: userId,
        limit: limit,
      }
    }
  );
  return response.data;
};

export const useGetRecommendations = (userId?: string, limit?: number) => {
  return useQuery({
    queryKey: ["recommendations", userId, limit],
    queryFn: () => getRecommendations({ userId, limit }),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30, // 30 seconds
  });
};
