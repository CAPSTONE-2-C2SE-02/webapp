import { BotMessageSquare, Minus, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    setMessages([...messages, inputValue]);
    setInputValue("");
  };

  const scrollToBottom = useCallback(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed right-8 bottom-8 w-10 h-10 rounded-full"
          size={"icon"}
        >
          <BotMessageSquare />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="rounded-2xl p-0 border-none overflow-hidden w-[320px] shadow-md"
        side="left"
        align="end"
        sideOffset={16}
      >
        <div className="flex flex-col">
          <div className="bg-primary rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <BotMessageSquare className="size-4 text-primary" />
              </div>
              <span className="text-white font-medium text-base">TripBot</span>
            </div>
            <Button
              className="rounded-full text-white w-8 h-8"
              variant={"ghost"}
              size={"icon"}
              onClick={() => setIsOpen(false)}
            >
              <Minus />
            </Button>
          </div>
          <ScrollArea className="h-[380px] w-full p-2">
            <div className="space-y-1">
              {messages.map((message, index) => (
                <div key={index} className="flex justify-end">
                  <p className="bg-primary/90 text-white rounded-xl rounded-br-sm text-sm px-3 py-2 max-w-[80%]">{message}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="bg-primary rounded-b-2xl rounded-t-md px-4 py-2 flex items-center justify-between">
            <input
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/70"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button
              className="rounded-full text-white w-8 h-8"
              variant={"ghost"}
              size={"icon"}
              onClick={handleSendMessage}
            >
              <Send />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Chatbot;
