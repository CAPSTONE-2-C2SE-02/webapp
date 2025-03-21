import { Slider } from "@/components/ui/slider";
import FilterWrapper from "./filter-wrapper";

const MAX_LENGTH = 21;
const MIN_LENGTH = 1;

interface LengthFilterProps {
  lengthRange: number[];
  setLengthRange: (value: number[]) => void;
} 

const LengthFilter = ({ lengthRange, setLengthRange }: LengthFilterProps) => {
  return (
    <FilterWrapper title="Length">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs">{lengthRange[0]} day</span>
        <span className="text-xs">{lengthRange[1]}{lengthRange[1] >= 21 ? "+" : ""} {lengthRange[1] > 1 ? "days" : "day"}</span>
      </div>
      <Slider
        defaultValue={lengthRange}
        max={MAX_LENGTH}
        min={MIN_LENGTH}
        step={1}
        value={lengthRange}
        onValueChange={setLengthRange}
      />
    </FilterWrapper>
  );
}

export default LengthFilter