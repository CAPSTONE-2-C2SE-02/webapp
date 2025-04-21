import { MessageCircle, Search } from "lucide-react";
import { Input } from "../ui/input";

const ChatSidebar = () => {
  return (
    <div className="bg-white p-3 px-4 border border-border rounded-lg flex flex-col w-full gap-5">
      <div className="text-primary font-semibold text-lg flex items-center gap-2">
        <MessageCircle className="size-5" strokeWidth={2} /> Messages
      </div>
      {/* search box */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-8"
        />
      </div>
      {/* conversation */}
      <div className="flex-1">
        <div className="font-medium text-xs text-muted-foreground">Recent Chats</div>
      </div>
    </div>
  );
};

export default ChatSidebar;
