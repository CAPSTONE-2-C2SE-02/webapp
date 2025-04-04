import { ApiResponse, UserInfo } from "@/lib/types";
import { rootApi } from "./root-api";
import { API } from "@/config/constants";
import axiosInstance from "@/config/api";
import axios from "axios";


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

export const fetchFollowers = async (): Promise<UserInfo[]> => {
  const response = await axiosInstance.get(API.PROFILE.FOLLOWERS);
  return response.data.result.map((user: any) => ({
    _id: user._id,
    fullName: user.fullName || "Unknown",
    profilePicture: user.profilePicture,
    role: user.role,
    // followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
  }));
};


export const fetchFollowings = async (): Promise<UserInfo[]> => {
  const response = await axiosInstance.get(API.PROFILE.FOLLOWINGS);
  return response.data.result.map((user: any) => ({
    _id: user._id,
    fullName: user.fullName || "Unknown",
    profilePicture: user.profilePicture,
    role: user.role,
    // followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
  }));
};

