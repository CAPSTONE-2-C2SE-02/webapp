import axiosInstance from "@/config/api";
import { Notification } from "@/lib/types";

export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await axiosInstance.get(`/notifications`);
  return response.data.result;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.put("/notifications/read-all");
  return response.data;
}; 

export const deleteNotification = async (notificationId: string) => {
  const response = await axiosInstance.delete(`/notifications/${notificationId}`);
  return response.data;
};