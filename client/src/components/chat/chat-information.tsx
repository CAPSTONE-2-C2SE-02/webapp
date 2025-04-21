import { cn } from "@/lib/utils";
import { BookMarked } from "lucide-react";

interface ChatInformationProps {
  isShow: boolean;
}

const ChatInformation = ({ isShow }: ChatInformationProps) => {
  return (
    <div
      className={cn(
        "bg-white p-3 border border-border rounded-lg",
        isShow ? "col-span-1" : "hidden"
      )}
    >
      {/* header */}
      <div className="text-primary font-semibold text-lg flex items-center gap-2 justify-center">
        <span>Informations</span>
        <BookMarked className="size-5" strokeWidth={2} /> 
      </div>
    </div>
  );
};

export default ChatInformation;
