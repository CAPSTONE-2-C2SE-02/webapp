import { cn } from "@/lib/utils";
import { TramFrontIcon } from "lucide-react";
import { Button } from "../ui/button";

interface ChatInformationProps {
  isShow: boolean;
}

const ChatInformation = ({ isShow }: ChatInformationProps) => {
  return (
    <div
      className={cn(
        "bg-white p-3 px-4 border border-border rounded-lg space-y-5",
        isShow ? "col-span-1" : "hidden"
      )}
    >
      {/* tour links */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 text-primary text-base font-medium">Attachments</div>
        <span className="text-muted-foreground text-xs">Tour links</span>
        <div className="flex flex-col gap-1 space-y-1">
          <div className="bg-muted p-1 flex gap-2 items-center rounded-sm">
            <TramFrontIcon className="size-4 text-primary flex-shrink-0" />
            <p className="line-clamp-1 text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veniam nemo vitae quos deserunt ex accusantium.</p>
          </div>
          <div className="bg-muted p-1 flex gap-2 items-center rounded-sm">
            <TramFrontIcon className="size-4 text-primary flex-shrink-0" />
            <p className="line-clamp-1 text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veniam nemo vitae quos deserunt ex accusantium.</p>
          </div>
          <div className="bg-muted p-1 flex gap-2 items-center rounded-sm">
            <TramFrontIcon className="size-4 text-primary flex-shrink-0" />
            <p className="line-clamp-1 text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veniam nemo vitae quos deserunt ex accusantium.</p>
          </div>
        </div>
        <Button size={"sm"} variant={"outline"} className="w-full text-primary">See All</Button>
      </div>
      {/* images */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 text-primary text-base font-medium">Images</div>
        <div className="grid grid-cols-3 gap-2 relative">
          <span className="absolute text-white right-8 text-lg top-1/2 -translate-y-1/2">+3</span>
          <div className="bg-black aspect-square rounded-lg"></div>
          <div className="bg-black aspect-square rounded-lg"></div>
          <div className="bg-black aspect-square rounded-lg"></div>
        </div>
        <Button size={"sm"} variant={"outline"} className="w-full text-primary">See All</Button>
      </div>
    </div>
  );
};

export default ChatInformation;
