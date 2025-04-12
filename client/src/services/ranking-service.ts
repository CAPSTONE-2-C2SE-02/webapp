import axiosInstance from "@/config/api";
import publicApi from "@/config/public.api"
import { ApiResponse } from "@/lib/types";

type Ranking = {
  _id: string;
  completionScore: number;
  attendanceScore: number;
  reviewScore: number;
  totalScore: number;
  tourGuideId: {
    _id: string;
    fullName: string;
    profilePicture: string;
  }
};

export const getRanking = async ({ limit = 10 }: { limit: number }): Promise<ApiResponse<Ranking[]>> => {
  const response = await publicApi.get("/rankings/top", {
    params: { limit }
  });
  return response.data;
};

export interface RankingType {
  type: "attendance" | "review" | "post" | "completion";
  limit: number;
}

export const getRankingType = async ({ type = "attendance", limit = 10 }: RankingType): Promise<ApiResponse<Ranking[]>> => {
  const response = await publicApi.get(`/rankings/top/${type}`, {
    params: { limit }
  });
  return response.data;
};

export const getAuthRanking = async (): Promise<ApiResponse<Ranking & { rank: number }>> => {
  const response = await axiosInstance.get("rankings/me");
  return response.data;
};