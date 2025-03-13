import { Search } from "lucide-react";

const SearchInput = () => {
  return (
    <div className="flex items-center gap-3 bg-zinc-100 min-w-96 w-full py-[9px] px-4 rounded-full flex-1">
      <Search className="size-4" />
      <input
        type="text"
        placeholder="Let's explore our platform"
        className="bg-transparent border-none outline-none placeholder:text-zinc-500 placeholder:text-sm leading-none flex-1"
      />
    </div>
  );
};

export default SearchInput;
