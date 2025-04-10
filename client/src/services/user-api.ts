import { ApiResponse, Calendar, SetAvailabilityResponse, UserInfo } from "@/lib/types";
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

export const getBusyDates = async (userId: string): Promise<Calendar> => {
  const response = await axiosInstance.get(API.CALENDER.SCHEDULE_INFO(userId));
  return response.data.result;
};

export const saveBusyDatesToServer = async (dates: Date[]): Promise<SetAvailabilityResponse> => {
  const formatted = dates.map((date) => ({
    date: format(date, 'yyyy-MM-dd'), // Format as YYYY-MM-DD
    status: 'UNAVAILABLE',
  }));
  const response = await axiosInstance.post(API.CALENDER.SCHEDULE, { dates: formatted });
  return response.data;
};