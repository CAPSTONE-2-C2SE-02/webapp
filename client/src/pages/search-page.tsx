import PostBookmark from "@/components/post/post-bookmark";
import TourBookmark from "@/components/tour/tour-bookmark";
import { ScrollArea } from "@/components/ui/scroll-area";
import MetaData from "@/components/utils/meta-data";
import useSearch from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") as string;

  const { data, status } = useSearch(searchQuery);

  const posts = data?.posts || [];
  const tours = data?.tours || [];

  return (
    <div className="my-3 w-full flex justify-center gap-3 h-[calc(100vh-6rem-1px)] overflow-hidden">
      <MetaData title={`${searchQuery} - Search result | TripConnect`} />
      {posts.length > 0 && (
        <ScrollArea className={cn("bg-white border border-border rounded-lg p-3", tours.length > 0 ? "flex-1" : "max-w-2xl")}>
          <div className="p-2">
            <h3 className="text-lg font-semibold text-primary text-center mb-2">Posts</h3>
            <PostBookmark data={posts} status={status} />
          </div>
        </ScrollArea>
      )}
      {tours.length > 0 && (
        <ScrollArea className={cn("bg-white border border-border rounded-lg p-3", posts.length > 0 ? "flex-1" : "max-w-2xl")}>
          <div className="p-2">
            <h3 className="text-lg font-semibold text-primary text-center mb-2">Tours</h3>
            <TourBookmark data={tours} status={status} />
          </div>
        </ScrollArea>
      )}
      {posts.length === 0 && tours.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-5 h-fit w-1/2">
          <h3 className="text-lg font-semibold text-primary text-center">No results found for "{searchQuery}"</h3>
          <p className="text-xs text-center text-muted-foreground">Search results only include things visible to you.</p>
        </div>
      )}
    </div>
  )
}

export default SearchPage