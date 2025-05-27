// import { useState } from "react"
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import LengthFilter from "./filter/length-filter"
// import LocationFilter from "./filter/location-filter"
import PriceFilter from "./filter/price-filter"
import RatingFilter from "./filter/rating-filter"
import { useState, useEffect } from "react";

interface TourFilterPanelProps {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  lengthRange: number[];
  setLengthRange: (value: number[]) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  onReset?: () => void;
}

const MAX_LENGTH = 21;
const MIN_LENGTH = 1;
const MAX_PRICE = 10000000;
const MIN_PRICE = 0;

const TourFilterPanel = ({ priceRange, setPriceRange, lengthRange, setLengthRange, minRating, setMinRating, onReset }: TourFilterPanelProps) => {
  // Local state for filter controls
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [localLengthRange, setLocalLengthRange] = useState(lengthRange);

  // Sync local state with props when reset
  useEffect(() => {
    setLocalPriceRange(priceRange);
    setLocalLengthRange(lengthRange);
  }, [priceRange, lengthRange]);

  const handleApplyPrice = () => {
    setPriceRange(localPriceRange);
  };
  const handleApplyLength = () => {
    setLengthRange(localLengthRange);
  };

  const handleReset = () => {
    setLocalPriceRange([MIN_PRICE, MAX_PRICE]);
    setLocalLengthRange([MIN_LENGTH, MAX_LENGTH]);
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setLengthRange([MIN_LENGTH, MAX_LENGTH]);
    setMinRating(0);
    if (onReset) onReset();
  };

  // const [locationValue, setLocationValue] = useState("");
  
  return (
    <>
      {/* <LocationFilter value={locationValue} setValue={setLocationValue} /> */}
      <PriceFilter
        priceRange={localPriceRange}
        setPriceRange={setLocalPriceRange}
        onApply={handleApplyPrice}
      />
      <LengthFilter
        lengthRange={localLengthRange}
        setLengthRange={setLocalLengthRange}
        onApply={handleApplyLength}
      />
      <RatingFilter minRating={minRating} setMinRating={setMinRating} />
      <Separator className="my-2" />
      <Button className="w-full" size={"sm"} onClick={handleReset} type="button">
        Reset Filter
      </Button>
    </>
  )
}

export default TourFilterPanel