import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Search } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { Skeleton } from "../ui/skeleton";
import TourSearchItem from "../tour/tour-search-item";
import PostSearchItem from "../post/post-search-item";
import useSearch from "@/hooks/useSearch";
import UserSearchItem from "../user/user-search-item";

const SearchInput = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce<string>(searchQuery, 1000);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useSearch(debouncedSearch);

  const posts = data?.posts || [];
  const tours = data?.tours || [];
  const users = data?.users || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navigateToSearchPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <div className="relative isolate" ref={searchRef}>
      <div className="hidden md:flex items-center gap-3 bg-zinc-100 border md:w-60 lg:w-80 py-[9px] px-4 rounded-full flex-1">
        <Search className="size-4 flex-shrink-0" />
        <input
          type="text"
          placeholder="Let's explore our platform"
          className="bg-transparent border-none outline-none text-sm placeholder:text-zinc-500 placeholder:text-sm leading-none flex-1"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={navigateToSearchPage}
        />
      </div>
      {searchQuery && isOpen && (
        <div className="absolute bg-white shadow-sm px-4 pb-2 pt-14 w-[106%] rounded-sm -top-2 left-1/2 -translate-x-1/2 -z-10">
          <p className="text-xs text-center font-medium text-primary">Search result for "{searchQuery}"</p>
          {isLoading && (
            <div className="flex flex-col gap-2 mt-2">
              <Skeleton className="w-full h-10 rounded-md" />
              <Skeleton className="w-full h-10 rounded-md" />
              <Skeleton className="w-full h-10 rounded-md" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>
          )}
          {(posts || tours || users) && (
            <>
              {posts?.length > 0 || tours?.length > 0 || users?.length > 0 ? (
                <div className="flex flex-col gap-1 mt-2">
                  {tours.length > 0 && (
                    <>
                      <span className="text-xs font-medium text-primary">Tours</span>
                      {tours.slice(0, 3).map((tour) => (
                        <TourSearchItem key={tour._id} tour={tour} />
                      ))}
                    </>
                  )}
                  {posts.length > 0 && (
                    <>
                      <span className="text-xs font-medium text-primary">Posts</span>
                      {posts.slice(0, 3).map((post) => (
                        <PostSearchItem key={post._id} post={post} />
                      ))}
                    </>
                  )}
                  {users.length > 0 && (
                    <>
                      <span className="text-xs font-medium text-primary">Users</span>
                      {users.slice(0, 3).map((user) => (
                        <UserSearchItem key={user._id} user={user} />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="py-2 mt-2 text-center text-xs font-medium rounded-md bg-gray-100">Not found tours or posts</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
