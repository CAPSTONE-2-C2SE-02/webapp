import { ApiResponse, Tour, TourList } from "@/lib/types";
import { rootApi } from "../root-api";
import axiosInstance from "@/config/api";
import axios from "axios";

export const tourApi = rootApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      createTour: builder.mutation<ApiResponse<string>, FormData>({
        query: (formData) => {
          return {
            url: "/tours",
            method: "POST",
            body: formData,
          };
        },
      }),
    };
  },
});

export const { useCreateTourMutation } = tourApi;

const BASE_API_URL = import.meta.env.VITE_API_URL;

export const fetchAllPostTourGuide = async (): Promise<Tour[]> => {
  const response = await axiosInstance.get('/tours/my-tours');
  return response.data.result;
};

export const fetchAllTours = async ({
  pageParam = 1,
  limit = 12,
  sortBy,
  sortOrder,
}: {
  pageParam: number;
  limit?: number;
  sortBy: string;
  sortOrder: string;
}): Promise<ApiResponse<TourList>> => {
  const response = await axios.get(`${BASE_API_URL}/tours`, {
    params: { page: pageParam, limit, sortBy, sortOrder },
  });
  return response.data;
};