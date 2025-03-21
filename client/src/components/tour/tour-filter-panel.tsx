import { useState } from "react"
import LengthFilter from "./filter/length-filter"
import LocationFilter from "./filter/location-filter"
import PriceFilter from "./filter/price-filter"
import RatingFilter from "./filter/rating-filter"
import TourTypeFilter from "./filter/tour-type-filter"

const MAX_LENGTH = 21;
const MIN_LENGTH = 1;
const MAX_PRICE = 1500;
const MIN_PRICE = 0;

const TourFilterPanel = () => {
  const [locationValue, setLocationValue] = useState("");
  const [lengthRange, setLengthRange] = useState([MIN_LENGTH, MAX_LENGTH]);
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([5]);
  const [tourType, setTourType] = useState<"all" | "travel" | "adventure" | "party" | "historical" | "cartrips">("all");

  const handleRatingChange = (rating: number) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter((r) => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };
  
  return (
    <>
      <LocationFilter value={locationValue} setValue={setLocationValue} />
      <TourTypeFilter value={tourType} setValue={setTourType} />
      <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
      <LengthFilter lengthRange={lengthRange} setLengthRange={setLengthRange} />
      <RatingFilter handleRatingChange={handleRatingChange} selectedRatings={selectedRatings} />
    </>
  )
}

export default TourFilterPanel