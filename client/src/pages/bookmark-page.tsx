import PostBookmark from "@/components/post/post-bookmark";
import TourBookmark from "@/components/tour/tour-bookmark";
import { ScrollArea } from "@/components/ui/scroll-area"
import MetaData from "@/components/utils/meta-data";
import { getAllBookmarks } from "@/services/bookmarks/bookmark-api"
import { useQuery } from "@tanstack/react-query"

const BookmarkPage = () => {
  const { data, status } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => getAllBookmarks(),
    refetchOnWindowFocus: false,
  });

  const posts = data?.posts || [];
  const tours = data?.tours || [];

  return (
    <div className="my-3 w-full flex gap-3 h-[calc(100vh-6rem-1px)] overflow-hidden">
      <MetaData title="Your Bookmarks" />
      <ScrollArea className="flex-1 bg-white border border-border rounded-lg p-3">
        <div className="p-2">
          <h3 className="text-lg font-semibold text-primary text-center mb-2">Posts Bookmarked</h3>
          <PostBookmark data={posts} status={status} />
        </div>
      </ScrollArea>
      <ScrollArea className="flex-1 bg-white border border-border rounded-lg p-3">
        <div className="p-2">
          <h3 className="text-lg font-semibold text-primary text-center mb-2">Tours Bookmarked</h3>
          <TourBookmark data={tours} status={status} />
        </div>
      </ScrollArea>
    </div>
  )
}

export default BookmarkPage