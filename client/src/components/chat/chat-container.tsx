import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Mic, PanelRight, Send } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import useMessage from "@/hooks/useMessage";
import MessageGroup from "./message-group";
import { UserSelectedState } from "@/lib/types";
import { Link } from "react-router";
import { useSendMessageMutation } from "@/services/messages/mutation";

interface ChatContainerProps {
  user: UserSelectedState | undefined;
  onShowInformation: (show: boolean) => void;
  showInformation: boolean;
}

const ChatContainer = ({ user, onShowInformation, showInformation }: ChatContainerProps) => {
  const { messages: messagesData, isMessagesLoading } = useMessage(user?._id as string);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const sendMessageMutation = useSendMessageMutation(user?._id as string);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [user?._id, messagesData]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    sendMessageMutation.mutate(inputValue);
    setInputValue("");
  };

  return (
    <div
      className={cn(
        "bg-white border border-border rounded-lg flex flex-col h-[calc(100vh-90px)]",
        showInformation ? "col-span-2" : "col-span-3"
      )}
    >
      {/* header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between bg-sky-200/30 backdrop-blur-sm border border-sky-200/70 py-2 px-3 sticky rounded-sm top-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-teal-400">
              <img
                src={user?.profilePicture}
                alt={user?.fullName}
                className="h-full w-full object-cover"
              />
            </Avatar>
            <div className="flex flex-col items-start gap-1">
              <span className="capitalize bg-teal-500 px-1 rounded text-xs font-medium text-white">{user?.role.split("_").join(" ").toLowerCase()}</span>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-center text-primary text-base leading-none">{user?.fullName}</h3>
                <Link to={`/${user?.username}`} className="text-xs font-medium text-slate-500 underline">{user?.username}</Link>
              </div>
            </div>
          </div>
          <Button
            size={"icon"}
            onClick={() => onShowInformation(!showInformation)}
            variant="ghost"
          >
            <PanelRight className="size-4 text-primary" />
          </Button>
        </div>
      </div>

      {/* messages */}
      {isMessagesLoading && (
        <div className="bg-white flex-1 px-4 py-2 flex items-center justify-center rounded-xl">
          <p className="text-center text-slate-500">Loading...</p>
        </div>
      )}
      {!isMessagesLoading && messagesData && (
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-1">
            {/* message */}
            <MessageGroup messages={messagesData} />
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* input box */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="pr-10 rounded-2xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <Button
              variant={"ghost"}
              size={"icon"}
              className="absolute size-8 right-1 top-1/2 -translate-y-1/2 rounded-full"
            >
              <Mic className="size-4" />
            </Button>
          </div>
          <Button
            size={"icon"}
            className="rounded-2xl"
            disabled={inputValue.trim() === ""}
            onClick={handleSendMessage}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
