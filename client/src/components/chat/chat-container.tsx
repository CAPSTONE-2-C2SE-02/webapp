import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Image, PanelRight, Send, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import useMessage from "@/hooks/useMessage";
import MessageGroup from "./message-group";
import { Tour, UserSelectedState } from "@/lib/types";
import { Link, useLocation, useNavigate } from "react-router";
import { useSendMessageMutation } from "@/services/messages/mutation";

interface ChatContainerProps {
  user: UserSelectedState | undefined;
  onShowInformation: (show: boolean) => void;
  showInformation: boolean;
}

const ChatContainer = ({ user, onShowInformation, showInformation }: ChatContainerProps) => {
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const hasSentTourRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages: messagesData, isMessagesLoading } = useMessage(user?._id as string);
  const sendMessageMutation = useSendMessageMutation(user?._id as string);
  
  const location = useLocation();
  const navigate = useNavigate();
  const tour = location.state?.tour as Tour;
  const sendTourImmediately = location.state?.sendTourImmediately;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [user?._id, messagesData]);

  useEffect(() => {
    if (user?._id && tour && sendTourImmediately && !hasSentTourRef.current) {
      sendMessageMutation.mutate({ content: "", tourId: tour?._id });
      hasSentTourRef.current = true;
      navigate(location.pathname, { replace: true });
    }
  }, [user?._id, tour, sendTourImmediately, sendMessageMutation, navigate, location.pathname]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "" && files.length === 0) return;
    sendMessageMutation.mutate({ content: inputValue, images: files.length ? files : undefined });
    setInputValue("");
    setFiles([]);
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
              <div className="flex items-end gap-2">
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
      {!isMessagesLoading && (
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-1">
            {/* message */}
            <MessageGroup messages={messagesData} />
            {sendMessageMutation.isPending && (
              <div className="flex items-end flex-col">
                <p className="text-center text-slate-500 px-2 text-xs animate-pulse">Sending...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* input box */}
      <div className="relative p-4 border-t">
        {/* preview images */}
        {files.length > 0 && (
          <div className="absolute left-3 bottom-20 p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-border">
            <div className="flex gap-2 overflow-x-auto max-w-[calc(100vw-6rem)]">
              {files.map((file, index) => (
                <div key={index} className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-300">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 rounded-full h-5 w-5"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  >
                    <X className="size-2 text-white" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
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
            <div className="absolute right-2 top-1/2 -translate-y-1/2 space-x-1 text-primary">
              {/* hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={e => setFiles(Array.from(e.target.files||[]))}
              />
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-8 rounded-2xl"
                onClick={() => fileInputRef.current?.click()}
                >
                <Image className="size-4" />
              </Button>
            </div>
          </div>
          <Button
            size={"icon"}
            className="rounded-2xl"
            disabled={(inputValue.trim() === "" && files.length === 0) || sendMessageMutation.isPending}
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
