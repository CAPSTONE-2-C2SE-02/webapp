import { searchPost } from "@/services/posts/post-api";
import { searchTours } from "@/services/tours/tour-api";
import { searchUser } from "@/services/users/user-api";
import { useQuery } from "@tanstack/react-query";

export default function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const [posts, tours, users] = await Promise.all([
        searchPost(query),
        searchTours(query),
        searchUser(query),
      ]);
      return { posts, tours, users };
    },
    select: (data) => {
      // flat data result
      return {
        posts: data?.posts?.result || [],
        tours: data?.tours?.result || [],
        users: data?.users?.result || [],
      }
    },
    enabled: Boolean(query),
  });
}
