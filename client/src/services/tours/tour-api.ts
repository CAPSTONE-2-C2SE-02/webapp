import { ApiResponse, Tour, TourList, TourMarker } from "@/lib/types";
import { rootApi } from "../root-api";
import axiosInstance from "@/config/api";
import publicApi from "@/config/public.api";

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

export const updateTour = async (id: string, formData: FormData): Promise<ApiResponse<Tour>> => {
  const response = await axiosInstance.put(`/tours/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

// get all tours created by author
export const fetchAllPostTourGuide = async (): Promise<ApiResponse<Tour[]>> => {
  const response = await axiosInstance.get('/tours/my-tours');
  return response.data;
};

// get all tours by usename
export const fetchTourByUsername = async (username: string): Promise<Tour[]> => {
  const response = await axiosInstance.get(`/tours/profile/${username}`);
  return response.data.result;
}

// get all tours
export const fetchAllTours = async ({
  pageParam = 1,
  limit = 12,
  sortBy,
  sortOrder,
  minPrice,
  maxPrice,
  minLength,
  maxLength,
  minRating,
}: {
  pageParam: number;
  limit?: number;
  sortBy: string;
  sortOrder: string;
  minPrice?: number;
  maxPrice?: number;
  minLength?: number;
  maxLength?: number;
  minRating?: number;
}): Promise<ApiResponse<TourList>> => {
  const response = await publicApi.get(`/tours`, {
    params: {
      page: pageParam,
      limit,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      minLength,
      maxLength,
      minRating,
    },
  });
  return response.data;
};

// get all tours are searched by destination or title
export const searchTours = async (query: string): Promise<ApiResponse<Tour[]>> => {
  const response = await publicApi.get(`/tours/search`, {
    params: { q: query }
  });
  return response.data;
};

// get tour by id
export const fetchTourById = async (id: string): Promise<Tour> => {
  const response = await axiosInstance.get(`/tours/${id}`);
  return response.data.result;
};

// delete tour by id
export const deleteTourById = async (id: string): Promise<ApiResponse<string>> => {
  const response = await axiosInstance.delete(`/tours/${id}`);
  return response.data;
};

// get all tours that traveler has booked and completed
export const fetchTourBookingComplete = async (): Promise<ApiResponse<Tour[]>> => {
  const response = await axiosInstance.get('/tours/tour-booking-complete');
  return response.data;
};

// get all tours markers
export const fetchAllToursMarkers = async (): Promise<ApiResponse<TourMarker[]>> => {
  const response = await publicApi.get('/tours/markers');
  return response.data;
};