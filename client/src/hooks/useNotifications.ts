import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/services/notifications/notification-api";
import { useEffect } from "react";
import { useAppSelector } from "./redux";
import { socketService } from "@/services/socket-service";
import { Notification } from "@/lib/types";
import { toast } from "sonner";

export default function useNotifications() {
  const queryClient = useQueryClient();
  const { token, userInfo } = useAppSelector(state => state.auth);

  // fetch notifications with infinite scroll
  const {
    data: notifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications()
  });

  // mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(["notifications"]) || [];

      queryClient.setQueryData<Notification[]>(["notifications"], (oldData = []) =>
        oldData.filter((n) => n._id !== notificationId)
      );

      return { previousNotifications };
    },
    onError: (error, _notificationId, context) => {
      queryClient.setQueryData(["notifications"], context?.previousNotifications);
      console.error("Failed to delete notification:", error.message);
      toast.error("Failed to delete notification", { description: error.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted successfully");
    },
  })

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
    };
  }, [token, queryClient, userInfo]);

  return {
    notifications,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
}; 