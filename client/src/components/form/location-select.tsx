import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import useLocationSearch from "@/hooks/useLocationSearch";
import { PinIcon } from "lucide-react";
import { LocationResult } from "@/lib/types";

type LocationSelectProps = {
  onChange: (val: LocationResult) => void;
  placeholder: string;
  value?: string;
};

const LocationSelect = ({ onChange, placeholder, value }: LocationSelectProps) => {
  const [query, setQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const { data: locations, isLoading, isError } = useLocationSearch(query);

  useEffect(() => {
    if (value) {
      setQuery(value);
    }
  }, [value]);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-10"
        onFocus={() => setIsFocused(true)}
      />
      {isFocused && query && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow-sm mt-1 max-h-60 overflow-y-auto">
          {isLoading && <li className="p-2 text-sm text-gray-500">Searching...</li>}
          {isError && <li className="p-2 text-sm text-red-500">Error...</li>}
          {!isLoading && locations?.map((location, index) => (
            <li
              key={`${location.name}-${index}`}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(location);
                setQuery(location.name);
                setIsFocused(false);
              }}
            >
              <div className="text-sm font-semibold text-gray-800 flex items-center mb-0.5"><PinIcon className="w-3 h-3 mr-1 text-teal-600 fill-current" />{location.name}</div>
              <div className="text-xs text-gray-500">{location.display_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSelect;