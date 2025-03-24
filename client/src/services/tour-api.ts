import { ApiResponse } from "@/lib/types";
import { rootApi } from "./root-api";

export const tourApi = rootApi.injectEndpoints({
    endpoints: (builder) => {
        return {
            createTour: builder.mutation<ApiResponse, FormData>({
                query: (formData) => {
                    return {
                        url: "/tours",
                        method: "POST",
                        body: formData,
                        responseHandler: (response) => response.text(),
                    };
                }
            })
        }
    }
})

export const { useCreateTourMutation } = tourApi