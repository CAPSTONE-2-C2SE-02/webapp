import axios from "axios";
import useDebounce from "./useDebounce";
import { useQuery } from "@tanstack/react-query";

export interface LocationResult {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
}

const fetchLocations = async (query: string): Promise<LocationResult[]> => {
  const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: query,
      countrycodes: "vn",
      format: "json",
      addressdetails: 1,
      limit: 5,
    },
  });

  return data.map((item: LocationResult) => ({
    name: item.name || item.display_name.split(",")[0],
    display_name: item.display_name,
  }));
};

export default function useLocationSearch(query: string) {
  const debouncedQuery = useDebounce(query);

  return useQuery<LocationResult[]>({
    queryKey: ["location-search", debouncedQuery],
    queryFn: () => fetchLocations(debouncedQuery),
    enabled: !!debouncedQuery,
    staleTime: 1000 * 60 * 5,
  });
}
