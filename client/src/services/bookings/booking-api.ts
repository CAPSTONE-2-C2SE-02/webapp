import axiosInstance from "@/config/api"
import publicApi from "@/config/public.api";
import { ApiResponse, PaymentResponse } from "@/lib/types";

export interface BookingData {
  tourId: string;
  startDate: Date;
  endDate: Date;
  adults: number;
  youths: number;
  children: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  country: string;
  address?: string;
  city: string;
  note?: string;
  isPayLater: boolean;
};

export const createBooking = async (bookingData: BookingData): Promise<ApiResponse<{ _id: string }>> => {
  const response = await axiosInstance.post("/bookings", bookingData);
  return response.data;
};

type PaymentRequest = {
  bookingId: string;
  typePayment?: "VNPAY" | "MOMO"
};

export const createPayment = async ({ bookingId, typePayment = "VNPAY" }: PaymentRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post("/payments", { bookingId, typePayment });
  return response.data;
};

export const getPayment = async (bookingId: string): Promise<ApiResponse<PaymentResponse>> => {
  const response = await axiosInstance.get(`/payments/booking/${bookingId}`);
  return response.data;
};

export const vnpReturn = async (params: Record<string, string>) => {
  const response = await publicApi.get("/payments/vnp-return", { params });
  return response.data;
};

export const createCancel = async ({
  bookingId,
  ...cancelData
}: {
  bookingId: string;
  secretKey: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  reason: string;
}) => {
  const response = await axiosInstance.post(`/bookings/${bookingId}/cancel`, cancelData);
  return response.data;
};

export const confirmCompleteTourByTourGuide = async (bookingId: string) => {
  const response = await axiosInstance.post(`/bookings/${bookingId}/confirm/tour-guide`);
  return response.data;
};

export const confirmCompleteTourByTraveler = async (bookingId: string) => {
  const response = await axiosInstance.post(`/bookings/${bookingId}/confirm/traveler`);
  return response.data;
};