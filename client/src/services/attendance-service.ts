import axiosInstance from "@/config/api";
import { ApiResponse } from "@/lib/types";

type Attendance = {
  _id: string;
  tourGuideId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

type CheckIn = {
  attendanceScore: number;
  totalScore: number;
}

export const getAttendanceDates = async (): Promise<ApiResponse<Attendance[]>> => {
  const response = await axiosInstance.get("/checkin");
  return response.data;
};

export const checkInDaily = async (): Promise<ApiResponse<CheckIn>> => {
  const response = await axiosInstance.post("/checkin");
  return response.data;
};