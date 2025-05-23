import PostBookmark from "@/components/post/post-bookmark";
import TourBookmark from "@/components/tour/tour-bookmark";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import UserSearchResult from "@/components/user/user-search-result";
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
  const users = data?.users || [];

  return (
    <div className="my-2 w-full max-w-3xl mx-auto flex justify-center gap-3 h-[calc(100vh-5.5rem-1px)] overflow-hidden">
      <MetaData title={`${searchQuery} - Search result | TripConnect`} />
      <Tabs defaultValue="posts" className="w-[768px]">
        <TabsList className="w-full grid grid-cols-3 bg-primary/80 text-white">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <ScrollArea className={cn("bg-white border border-border rounded-lg p-3 w-full h-[calc(100vh-8.25rem-1px)]")}>
            <div className="p-2">
              <PostBookmark data={posts} status={status} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="tours">
          <ScrollArea className={cn("bg-white border border-border rounded-lg p-3 w-full h-[calc(100vh-8.25rem-1px)]")}>
            <div className="p-2">
              <TourBookmark data={tours} status={status} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="users">
          <ScrollArea className={cn("bg-white border border-border rounded-lg p-3 w-full h-[calc(100vh-8.25rem-1px)]")}>
            <div className="p-2">
              <UserSearchResult data={users} status={status} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      {posts.length === 0 && tours.length === 0 && users.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-5 h-fit w-1/2">
          <h3 className="text-lg font-semibold text-primary text-center">No results found for "{searchQuery}"</h3>
          <p className="text-xs text-center text-muted-foreground">Search results only include things visible to you.</p>
        </div>
      )}
    </div>
  )
}

export default SearchPage