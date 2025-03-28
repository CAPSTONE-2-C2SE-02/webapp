import { ApiResponse, Tour } from "@/lib/types";
import { rootApi } from "../root-api";
import axiosInstance from "@/config/api";

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

export const fetchAllPostTourGuide = async (): Promise<Tour[]> => {
  const response = await axiosInstance.get('/tours/my-tours');
  return response.data.result;
};
