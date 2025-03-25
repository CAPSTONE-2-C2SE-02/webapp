import { ApiResponse } from "@/lib/types";
import { rootApi } from "./root-api";

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
