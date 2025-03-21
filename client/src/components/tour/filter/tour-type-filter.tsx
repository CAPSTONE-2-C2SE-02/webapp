import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FilterWrapper from "./filter-wrapper";
import { Label } from "@/components/ui/label";

interface TourTypeFilterProps {
  value: "all" | "travel" | "adventure" | "party" | "historical" | "cartrips";
  setValue: (value: "all" | "travel" | "adventure" | "party" | "historical" | "cartrips") => void;
}

const TourTypeFilter = ({ value, setValue }: TourTypeFilterProps) => {
  return (
    <FilterWrapper title="Tour Type">
      <RadioGroup
        defaultValue="all"
        className="grid-cols-2 gap-2"
        value={value}
        onValueChange={setValue}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="r1" />
          <Label htmlFor="r1">All</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="travel" id="r2" />
          <Label htmlFor="r2">Travel</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="adventure" id="r3" />
          <Label htmlFor="r3">Adventure</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="party" id="r4" />
          <Label htmlFor="r4">Party</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="historical" id="r5" />
          <Label htmlFor="r5">Historical</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cartrip" id="r6" />
          <Label htmlFor="r6">Car Trip</Label>
        </div>
      </RadioGroup>
    </FilterWrapper>
  );
};

export default TourTypeFilter;
