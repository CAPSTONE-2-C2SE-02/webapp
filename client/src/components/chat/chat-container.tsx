import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "../ui/avatar";
import useAuthInfo from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { Mic, PanelRight, Send } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { format } from "date-fns";
import { Input } from "../ui/input";

type Message = {
  id: string;
  content: string;
  sender: "user" | "friend";
  timestamp: Date;
};

interface ChatContainerProps {
  onShowInformation: (show: boolean) => void;
  showInformation: boolean;
}

const ChatContainer = ({ onShowInformation, showInformation }: ChatContainerProps) => {
  const auth = useAuthInfo();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "friend",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${inputValue}"`,
        sender: "friend",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }, 1500);

    setMessages((prev) => [...prev, userMessage]);
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
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <img
                src={auth?.profilePicture}
                alt={auth?.fullName}
                className="h-full w-full object-cover"
              />
            </Avatar>
            <div>
              <h2 className="font-semibold">{auth?.fullName}</h2>
              <p className="text-xs text-muted-foreground capitalize">
                {auth?.role}
              </p>
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
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {/* message */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[60%] rounded-xl px-4 py-2",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <div
                  className={cn(
                    "text-[10px] mt-0.5",
                    message.sender === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {format(message.timestamp, "p")}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

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
