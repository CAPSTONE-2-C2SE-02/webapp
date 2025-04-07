import { UserInfo } from "@/lib/types";
import axiosInstance from "@/config/api";

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