import FilterWrapper from "./filter-wrapper";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface PriceFilterProps {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
}

const MAX_PRICE = 1500;
const MIN_PRICE = 0;

const PriceFilter = ({ priceRange, setPriceRange }: PriceFilterProps) => {
  return (
    <FilterWrapper title="Price">
      <div className="flex items-center justify-between gap-4">
        <Input type="text" value={`$ ${priceRange[0]}`} readOnly />
        <div className="w-5 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
        <Input type="text" value={`$ ${priceRange[1]}`} readOnly />
      </div>
      <Slider
        defaultValue={priceRange}
        max={MAX_PRICE}
        min={MIN_PRICE}
        step={1}
        value={priceRange}
        onValueChange={setPriceRange}
      />
    </FilterWrapper>
  );
};

export default PriceFilter;
