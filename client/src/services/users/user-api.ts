import { UserInfo } from "@/lib/types";
import axiosInstance from "@/config/api";
import { ApiResponse, SetAvailabilityResponse } from "@/lib/types";
import { rootApi } from "../root-api";
import { API } from "@/config/constants";
import { format } from "date-fns/format";

export const userApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfoByUsername: builder.query<ApiResponse<UserInfo>, string>({
      query: (username) => ({
        url: `/users/profile/${username}`,
        method: "GET"
      })
    })
  })
});

export const { useGetUserInfoByUsernameQuery } = userApi;

export const followUser = async (userId: string) => {
  const response = await axiosInstance.post(API.PROFILE.FOLLOW(userId));
  return response.data;
};

export const getUserByUsername = async (username: string): Promise<UserInfo> => {
  const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/${API.PROFILE.USER_INFO(username)}`);
  return response.data.result;
};

// export const getBusyDates = async (userId: string) => {
//   const response = await axiosInstance.get(API.CALENDER.SCHEDULE_INFO(userId))
//   return response.data.result
// }

export const getBusyDates = async (userId: string): Promise<string[]> => {
  const response = await axiosInstance.get(API.CALENDER.SCHEDULE_INFO(userId));
  const dates = response.data.result;
  // Ensure dates is an array; return empty array if not
  if (!Array.isArray(dates)) {
    console.error('Invalid response from getBusyDates:', dates);
    return [];
  }
  // Filter out invalid date strings
  return dates.filter((date: unknown) => typeof date === 'string' && !isNaN(new Date(date).getTime()));
};

export const saveBusyDatesToServer = async (dates: Date[]): Promise<SetAvailabilityResponse> => {
  const formatted = dates.map((date) => ({
    date: format(date, 'yyyy-MM-dd'), // Format as YYYY-MM-DD
    status: 'UNAVAILABLE',
  }));
  const response = await axiosInstance.post(API.CALENDER.SCHEDULE, { dates: formatted });
  return response.data;
};


export const updateUserProfile = async ({
  userId,
  data,
  token,
}: {
  userId: string;
  data: FormData | Record<string, any>;
  token: string;
}): Promise<UserInfo> => {
  try {
    const response = await axiosInstance.put(`/profiles/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(data instanceof FormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" }),
      },
    });

    console.log("Response from server:", response.status, response.data);

    if (!response?.data) {
      throw new Error("No data returned from server");
    }

    if (!response.data.result) {
      throw new Error("Invalid response format: missing 'result' field");
    }

    return response.data.result;
  } catch (error: any) {
    console.error("Error in updateUserProfile:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    const errorMessage =
      error.response?.data?.error?.[0] ||
      (error.response?.status === 400
        ? "Bad request: Invalid data sent to server"
        : error.message) ||
      "Failed to update profile due to an unknown error";
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