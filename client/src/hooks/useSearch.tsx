import { searchPost } from "@/services/posts/post-api";
import { searchTours } from "@/services/tours/tour-api";
import { useQuery } from "@tanstack/react-query";

export default function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const [posts, tours] = await Promise.all([
        searchPost(query),
        searchTours(query),
      ]);
      return { posts, tours };
    },
    select: (data) => {
      // flat data result
      return {
        posts: data?.posts?.result || [],
        tours: data?.tours?.result || [],
      }
    },
    enabled: Boolean(query),
  });
}
