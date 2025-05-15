import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Search } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { Skeleton } from "../ui/skeleton";
import TourSearchItem from "../tour/tour-search-item";
import PostSearchItem from "../post/post-search-item";
import useSearch from "@/hooks/useSearch";

const SearchInput = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce<string>(searchQuery, 1000);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useSearch(debouncedSearch);

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
    if (e.key === "Enter") {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <div className="relative isolate" ref={searchRef}>
      <div className="flex items-center gap-3 bg-zinc-100 min-w-80 w-full py-[9px] px-4 rounded-full flex-1">
        <Search className="size-4" />
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
          {(data?.posts || data?.tours) && (
            <>
              {data?.posts?.length > 0 || data?.tours?.length > 0 ? (
                <div className="flex flex-col gap-1 mt-2">
                  {data.tours.length > 0 && (
                    <>
                      <span className="text-xs font-medium text-primary">Tours</span>
                      {data.tours.slice(0, 3).map((tour) => (
                        <TourSearchItem key={tour._id} tour={tour} />
                      ))}
                    </>
                  )}
                  {data.posts.length > 0 && (
                    <>
                      <span className="text-xs font-medium text-primary">Posts</span>
                      {data.posts.slice(0, 3).map((post) => (
                        <PostSearchItem key={post._id} post={post} />
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
