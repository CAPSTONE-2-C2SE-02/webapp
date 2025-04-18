import { ApiResponse, Booking, Calendar, SetAvailabilityResponse, UserInfo } from "@/lib/types";
import { rootApi } from "../root-api";
import { API } from "@/config/constants";
import axiosInstance from "@/config/api";
import axios from "axios";
import { format } from "date-fns";
import publicApi from "@/config/public.api";

export const userApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfoByUsername: builder.query<ApiResponse<UserInfo>, string>({
      query: (username) => ({
        url: `/users/profile/${username}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUserInfoByUsernameQuery } = userApi;

export const followUser = async (userId: string) => {
  const response = await axiosInstance.post(API.PROFILE.FOLLOW(userId));
  return response.data;
};

export const getUserByUsername = async (username: string): Promise<UserInfo> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/${API.PROFILE.USER_INFO(username)}`);
  return response.data.result;
};

export const getBusyDates = async (userId: string): Promise<Calendar> => {
  const response = await axiosInstance.get(API.CALENDER.SCHEDULE_INFO(userId));
  return response.data.result;
};

export const saveBusyDatesToServer = async (dates: Date[]): Promise<SetAvailabilityResponse> => {
  const formatted = dates.map((date) => ({
    date: format(date, "yyyy-MM-dd"),
    status: "UNAVAILABLE",
  }));
  const response = await axiosInstance.post(API.CALENDER.SCHEDULE, { dates: formatted });
  return response.data;
};

export const deleteBusyDate = async (date: Date) => {
  // const dateFormatted = format(date, "yyyy-MM-dd");
  const response = await axiosInstance.patch(API.CALENDER.DELETE_BUSY_DATE, { date });
  return response.data;
};

export const fetchTravelerBookings = async (): Promise<Booking[]> => {
  const response = await axiosInstance.get(API.BOOKING.TRAVELER_BOOKING);
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch traveler bookings");
  }
  return response.data.result;
};

export const fetchTourGuideBookings = async (): Promise<Booking[]> => {
  const response = await axiosInstance.get(API.BOOKING.TOURGUIDE_BOOKING);
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch tour guide bookings");
  }
  return response.data.result;
};

export const updateUserProfile = async ({
  userId,
  data,
}: {
  userId: string;
  data: FormData | Record<string, any>;
}): Promise<UserInfo> => {
  try {
    if (data instanceof FormData) {
      const profilePicture = data.get("profilePicture");
      const coverPhoto = data.get("coverPhoto");
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (profilePicture instanceof File) {
        if (!validTypes.includes(profilePicture.type)) {
          throw new Error("Profile picture must be JPEG, JPG or PNG");
        }
        if (profilePicture.size > maxSize) {
          throw new Error("Avatar must not exceed 5MB");
        }
      }

      if (coverPhoto instanceof File) {
        if (!validTypes.includes(coverPhoto.type)) {
          throw new Error("Cover photo must be JPEG, JPG or PNG");
        }
        if (coverPhoto.size > maxSize) {
          throw new Error("Cover photo must not exceed 5MB");
        }
      }

      console.log("Send FormData:", [...data.entries()]);
    } else {
      console.log("Send JSON data:", data);
    }

    const response = await axiosInstance.put(API.PROFILE.UPDATE_INFO(userId), data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });

    console.log("Response from server:", response.data);

    if (!response?.data) {
      throw new Error("No data received from server");
    }

    if (!response.data.result) {
      throw new Error("Invalid response format: missing field 'result'");
    }

    if (data instanceof FormData) {
      const result = response.data.result;
      if (!result.profilePicture && data.get("profilePicture")) {
        console.warn("Avatar not updated in response");
      }
      if (!result.coverPhoto && data.get("coverPhoto")) {
        console.warn("Cover photo not updated in response");
      }
    }

    return response.data.result;
  } catch (error: any) {
    console.error("Error in updateUserProfile:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    let errorMessage = "Unable to update profile. Please try again later.";
    if (error.response?.status === 500) {
      errorMessage = "Server Error: Unable to process uploaded file. Please check the file format (JPEG/PNG) and try again.";
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.status === 400) {
      errorMessage = "The submitted data is invalid. Please check again.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const fetchUserInfoByUsername = async (username: string): Promise<UserInfo> => {
  const response = await axiosInstance.get(`/users/profile/${username}`);
  return response.data.result;
};

export const fetchMyInfo = async (): Promise<UserInfo> => {
  const response = await axiosInstance.get("/profiles/myInfo");
  return response.data.result;
};

export const getAllPhotosByUsername = async (
  username: string
): Promise<
  ApiResponse<{
    profilePicture: string;
    coverPhoto: string;
    postImages: string[];
  }>
> => {
  const response = await publicApi.get(API.PROFILE.PHOTOS(username));
  return response.data;
};