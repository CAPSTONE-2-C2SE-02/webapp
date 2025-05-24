import { Bot, BotMessageSquare, Minus, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

export interface MessageChatBot {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageChatBot[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: MessageChatBot = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
  };

  const scrollToBottom = useCallback(() => scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" }), []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: "Hi! I'm a Tripconnect calendar assistant. I can help you find tours, book tickets, or answer questions. Where would you like to get started",
          role: 'assistant',
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
        className="rounded-2xl p-0 border-none overflow-hidden w-[340px] shadow-md"
        side="left"
        align="end"
        sideOffset={16}
      >
        <div className="flex flex-col">
          {/* header */}
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
          {/* messages */}
          <ScrollArea className="h-[380px] w-full p-2">
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-2 w-full',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Bot className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 break-words shadow-md',
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={scrollAreaRef} />
            </div>
          </ScrollArea>
          {/* input */}
          <div className="bg-primary rounded-b-2xl rounded-t-md px-4 py-2 flex items-center justify-between">
            <input
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/70"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
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
