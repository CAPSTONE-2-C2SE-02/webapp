import FilterWrapper from "./filter-wrapper";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PriceFilterProps {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  onApply: () => void;
}

const MAX_PRICE = 1500000;
const MIN_PRICE = 0;

const PriceFilter = ({ priceRange, setPriceRange, onApply }: PriceFilterProps) => {
  return (
    <FilterWrapper title="Price">
      <div className="flex items-center justify-between gap-2">
        <Input type="text" value={`$ ${priceRange[0]}`} readOnly />
        <div className="w-3 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
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
      <Button size={"sm"} className="w-full mt-2" onClick={onApply}>Apply</Button>
    </FilterWrapper>
  );
};

export default PriceFilter;
