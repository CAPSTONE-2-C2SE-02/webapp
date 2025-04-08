import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationAsRead } from "@/services/notifications/notification-api";
import { useEffect } from "react";
import { useAppSelector } from "./redux";
import { socketService } from "@/services/socket-service";
import { Notification } from "@/lib/types";
// import { Notification } from "@/lib/types";

export default function useNotifications() {
  const queryClient = useQueryClient();
  const { token, userInfo } = useAppSelector(state => state.auth);

  // Fetch notifications with infinite scroll
  const {
    data: notifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications()
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all notifications as read
  // const markAllAsReadMutation = useMutation({
  //   mutationFn: markAllNotificationsAsRead,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["notifications"] });
  //   },
  // });

  // setup socket connection and listeners
  useEffect(() => {
    const socket = socketService.connect(token || undefined);

    socket.emit("addNewUser", userInfo?._id);

    socket.on("new_notification", (notification: Notification) => {
      console.log("Received new_notification event:", notification);
      queryClient.setQueryData<Notification[]>(["notifications"], (oldData = []) => [
        notification,
        ...oldData,
      ]);
    });

    return () => {
      socket.off("new_notification");
      socket.off("connect");
    };
  }, [token, queryClient, userInfo]);

  return {
    notifications,
    markAsRead: markAsReadMutation.mutate,
    // markAllAsRead: markAllAsReadMutation.mutate,
  };
}; 