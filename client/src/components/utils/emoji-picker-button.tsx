import { Smile } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "../ui/emoji-picker";

interface EmojiPickerButtonProps {
  className?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const EmojiPickerButton = ({ className, isOpen, onOpenChange }: EmojiPickerButtonProps) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(className)}>
          <Smile className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-none">
        <EmojiPicker
          onEmojiSelect={(emoji) => {
            onOpenChange(false);
            console.log(emoji);
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export default EmojiPickerButton