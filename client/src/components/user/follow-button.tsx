import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser } from "@/services/users/user-api"; // API gọi đến backend
import { UserInfo } from "@/lib/types";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  initialIsFollowing: boolean;
}

const FollowButton = ({ targetUserId, currentUserId, initialIsFollowing }: FollowButtonProps) => {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const followMutation = useMutation({
    mutationFn: () => followUser(targetUserId),
    onMutate: async () => {
      const queryKey = ["user-profile", targetUserId];

      // Cancel pending refetch to avoid overwriting old data
      await queryClient.cancelQueries({ queryKey });

      // get user data previous
      const previousUser = queryClient.getQueryData<UserInfo>(queryKey);

      // update UI (Optimistic UI)
      queryClient.setQueryData(queryKey, (old: UserInfo | undefined) => {
        if (!old) return old;
        const updatedUser = {
          ...old,
          followers: isFollowing
            ? old.followers.filter(user => user._id !== currentUserId) // Unfollow
            : [...old.followers, currentUserId] // Follow
        };
        return updatedUser;
      });

      // Update state to force component to re-render immediately
      setIsFollowing(!isFollowing);

      return { previousUser };
    },
    onError: (_err, _variables, context) => {
      // Rollback to old data if there is an error
      queryClient.setQueryData(["user", targetUserId], context?.previousUser);
      setIsFollowing(initialIsFollowing); // Reset UI
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["user", targetUserId] });
      }, 2000);
    },
  });
  const handleFollow = () => {
    followMutation.mutate()
  }
  return (
    <Button
      onClick={handleFollow}
      size={"sm"}
      variant={isFollowing ? "outline" : "default"}
      className={isFollowing ? "text-primary border-primary hover:bg-teal-50" : "bg-primary hover:bg-primary"}
    >
      {isFollowing ? <UserCheck /> : <UserPlus />}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
