import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkInfo } from "@/lib/types";
import { bookmark, getBookmark, ItemType, unbookmark } from "@/services/bookmarks/bookmark-api";
import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface BookMarkButtonProps {
  itemId: string;
  itemType: ItemType;
  initialState: BookmarkInfo;
  className?: string;
}

const BookMarkButton = ({
  itemId,
  itemType,
  initialState,
  className,
}: BookMarkButtonProps) => {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", itemId];

  const { data } = useQuery({
    queryKey,
    queryFn: () => getBookmark(itemType, itemId),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () => data.isBookmarkedByUser ? unbookmark(itemType, itemId) : bookmark(itemType, itemId),
    onMutate: async () => {
      toast.success(`${data.isBookmarkedByUser ? "Removed from" : "Added to"} bookmarks`);
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<BookmarkInfo>(queryKey, context?.previousState);
      console.error(err);
      if (err instanceof  AxiosError) {
        toast.error(err?.response?.data?.error || "Something went wrong. Please try again.");
      }
    },
  })

  return (
    <Button
      type="button"
      onClick={() => mutate()}
      size={"icon"}
      variant={itemType === "tour" ? "outline" : "ghost"}
      className={cn("bg-white/60 backdrop-blur-sm", className)}
    >
      <Bookmark
        className={cn(
          "size-4 text-primary",
          data.isBookmarkedByUser && "fill-primary"
        )}
      />
    </Button>
  );
}

export default BookMarkButton