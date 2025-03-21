import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, MapPinned } from "lucide-react";
import { useState } from "react";

interface LocationFilterProps {
  value: string;
  setValue: (value: string) => void;
}

const LocationFilter = ({ value, setValue }: LocationFilterProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 pt-4 pb-5 border border-slate-200 bg-white rounded-lg flex flex-col gap-3">
      <p className="text-base font-medium text-primary">Location</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-expanded={open}
            className="justify-between"
          >
            <div className="flex gap-2 items-center">
              <MapPinned className="size-4" />
              <span className="font-normal">{value ? "Da Nang" : "Select Location"}</span>
            </div>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandInput placeholder="Search location..." className="h-9" />
            <CommandList>
              <CommandEmpty>No location found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="danang"
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  Da Nang
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationFilter;
