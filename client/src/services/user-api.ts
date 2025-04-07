import { ApiResponse, SetAvailabilityResponse, UserInfo } from "@/lib/types";
import { rootApi } from "./root-api";
import { API } from "@/config/constants";
import axiosInstance from "@/config/api";
import axios from "axios";
import { format } from "date-fns";


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
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/${API.PROFILE.USER_INFO(username)}`);
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