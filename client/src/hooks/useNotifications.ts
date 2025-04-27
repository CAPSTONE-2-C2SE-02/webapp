import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/services/notifications/notification-api";
import { useEffect } from "react";
import { Notification } from "@/lib/types";
import { toast } from "sonner";
import { useSocket } from "@/context/socket-context";

export default function useNotifications() {
  const queryClient = useQueryClient();
  const socket = useSocket();

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
    socket?.on("new_notification", (notification: Notification) => {
      console.log("Received new_notification event:", notification);
      queryClient.setQueryData<Notification[]>(["notifications"], (oldData = []) => [
        ...oldData,
        notification,
      ]);
    });

    return () => {
      socket?.off("new_notification");
    };
  }, [queryClient, socket]);

  return {
    notifications,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
}; 