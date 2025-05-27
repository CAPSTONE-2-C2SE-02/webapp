import { Bot, BotMessageSquare, Minus, Send, User, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import LoadingDots from "../utils/loading-dots";
import { useNavigate } from "react-router";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  tours?: Tour[];
}

interface Tour {
  id: string;
  title: string;
  duration: string;
  departure: string;
  price: string;
  description: string;
  destination: string;
  maxParticipants: string;
  score: number;
}

const CHATBOT_API_URL = "http://localhost:5002/flask";

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatTourList = (tours: Tour[], destination: string) => {
    return tours.map((tour, index) => {
      return `${index + 1}. [${tour.title}](${tour.id})\n   - Điểm đến: ${tour.destination}\n   - Giá: ${tour.price} VND\n   - Thời gian: ${tour.duration}\n   - Số người tối đa: ${tour.maxParticipants} người\n   - Mô tả: ${tour.description}`;
    }).join("\n\n");
  };

  const handleTourClick = (tourId: string) => {
    console.log("Navigating to tour:", tourId);
    navigate(`/tours/${tourId}`);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      toast.error("Vui lòng nhập tin nhắn!", {
        description: "Tin nhắn không được để trống.",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      console.log(`[${new Date().toISOString()}] Sending request to ${CHATBOT_API_URL}`);
      const response = await fetch(`${CHATBOT_API_URL}?message=${encodeURIComponent(inputValue)}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      console.log(`[${new Date().toISOString()}] Response status: ${response.status}`);
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Response data:`, data);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Có lỗi xảy ra khi xử lý yêu cầu.");
      }

      let content = data.message;
      if (data.status === "success" && data.tour_data?.length > 0) {
        const tours = data.tour_data;
        const destination = tours[0].destination || "điểm đến không xác định";
        const tourList = formatTourList(tours, destination);
        content = `Tôi tìm thấy ${tours.length} tour đến ${destination}:\n\n${tourList}`;
      } else if (data.status === "warning") {
        content = data.message || "Không tìm thấy tour nào phù hợp. Bạn có thể thử tìm điểm đến khác!";
      } else if (data.status === "error") {
        throw new Error(data.message || data.error || "Có lỗi xảy ra khi xử lý yêu cầu.");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content,
        role: "assistant",
        timestamp: new Date(),
        tours: data.tour_data,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error sending message:`, error);
      const errorMsg = error instanceof Error ? error.message : "Có lỗi xảy ra khi xử lý yêu cầu.";
      toast.error(`Không thể gửi tin nhắn: ${errorMsg}`, {
        description: "Vui lòng kiểm tra kết nối hoặc thử lại sau.",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Xin lỗi, đã có lỗi xảy ra: ${errorMsg}. Vui lòng thử lại sau.`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "1",
          content:
            "Xin chào! Tôi là trợ lý lịch trình Tripconnect. Tôi có thể giúp bạn tìm tour, đặt vé, hoặc trả lời câu hỏi. Bạn muốn bắt đầu từ đâu?",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.role === "assistant" && message.tours) {
      const paragraphs = message.content.split("\n\n");
      return (
        <div className="space-y-4">
          {paragraphs.map((paragraph, i) => {
            if (i === 0) return <p key={i} className="text-sm">{paragraph}</p>;
            
            // Find the tour that matches this paragraph
            const tourMatch = paragraph.match(/\[(.*?)\]\((.*?)\)/);
            if (tourMatch) {
              const [_, title, id] = tourMatch;
              const tour = message.tours?.find(t => t.id === id);
              if (tour) {
                return (
                  <div key={i} className="space-y-2 bg-white rounded-lg p-3 shadow-sm">
                    <div
                      onClick={() => handleTourClick(tour.id)}
                      className="text-primary hover:underline font-medium text-left w-full cursor-pointer text-base"
                    >
                      {tour.title}
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Điểm đến:</span>
                        <span>{tour.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Giá:</span>
                        <span className="text-primary font-medium">{tour.price} VND</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Thời gian:</span>
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Số người tối đa:</span>
                        <span>{tour.maxParticipants} người</span>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium text-gray-700 block mb-1">Mô tả:</span>
                        <p className="text-gray-600">{tour.description}</p>
                      </div>
                    </div>
                  </div>
                );
              }
            }
            return <p key={i} className="text-sm whitespace-pre-line">{paragraph}</p>;
          })}
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-line">{message.content}</p>;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed right-8 bottom-8 w-10 h-10 rounded-full bg-primary hover:bg-primary/90"
          size="icon"
        >
          <BotMessageSquare className="text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="rounded-2xl p-0 border-none overflow-hidden w-[380px] shadow-lg"
        side="left"
        align="end"
        sideOffset={16}
      >
        <div className="flex flex-col h-[500px]">
          <div className="bg-primary rounded-t-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <BotMessageSquare className="size-4 text-primary" />
              </div>
              <span className="text-white font-medium text-base">TripBot</span>
            </div>
            <Button
              className="rounded-full text-white w-8 h-8 hover:bg-white/10"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <Minus />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Bot className="h-6 w-6 text-primary mt-1" />
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 break-words whitespace-pre-wrap",
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    {renderMessageContent(message)}
                  </div>
                  {message.role === "user" && (
                    <User className="h-6 w-6 text-primary mt-1" />
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <LoadingDots />
                  </div>
                </div>
              )}
              <div ref={scrollAreaRef} />
            </div>
          </ScrollArea>
          <div className="bg-primary rounded-b-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/70 resize-none min-h-[24px] max-h-[150px] overflow-y-auto"
                placeholder="Nhập tin nhắn của bạn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                maxLength={2000}
                disabled={isLoading}
                style={{ lineHeight: "24px" }}
              />
              <Button
                className="rounded-full text-white w-8 h-8 hover:bg-white/10"
                variant="ghost"
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send />}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Chatbot;