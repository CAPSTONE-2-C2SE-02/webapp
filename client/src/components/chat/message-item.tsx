import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { Link } from "react-router";
import { getAbsoluteAddress } from "../utils/convert";
import ImagesLightbox from "../utils/images-lightbox";
import useLightBox from "@/hooks/useLightBox";

interface MessageItemProps {
  message: Message;
  isFirstInGroup: boolean;
  currentUserId: string | undefined;
}

const MessageItem = ({
  message,
  isFirstInGroup,
  currentUserId,
}: MessageItemProps) => {
  const { isLightboxOpen, currentImageIndex, setCurrentImageIndex, openLightbox, closeLightbox } = useLightBox();
  
  const sender = message.sender;
  const isCurrentUser = message.sender._id === currentUserId;

  const renderMessage = () => {
    if (message.messageType === "text") {
      return (
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-sm",
            isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
          )}
        >
          {message.content}
        </div>
      )
    }
    if (message.messageType === "tour") {
      return (
        <Link to={`/tours/${message.tour?._id}`} target="_blank" className="w-full">
          <div className="flex gap-3 shadow-sm p-3 border border-primary/20 rounded-lg bg-white">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
              <img src={message.tour?.imageUrls[0]} alt={message.tour?.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 space-y-1 text-sm">
              <h3 className="font-medium line-clamp-1 text-primary">{message.tour?.title}</h3>
              <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                <span>{getAbsoluteAddress(message.tour?.destination, message.tour?.departureLocation)}</span>
                <span>•</span>
                <span>{message.tour?.duration} days</span>
                <span>•</span>
                <span>From {message.tour?.priceForAdult.toLocaleString()} VND</span>
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">{message.tour?.introduction}</p>
            </div>
          </div>
        </Link>
      )
    }
    if (message.messageType === "image") {
      return (
        <>
          <div className={cn("flex flex-wrap gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
            {message.imageUrls.map((url, index) => (
              <img key={url} src={url} loading="lazy" className="min-h-40 max-w-64 object-cover rounded" onClick={() => openLightbox(index)} />
            ))}
          </div>
          {message?.content && (
            <div
              className={cn(
                "rounded-xl px-3 py-2 text-sm mt-1",
                isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
              )}
            >
              {message.content}
            </div>
          )}
          {isLightboxOpen && (
            <ImagesLightbox
              images={message.imageUrls}
              currentIndex={currentImageIndex}
              setCurrentIndex={setCurrentImageIndex}
              onClose={closeLightbox}
              type="image"
            />
          )}
        </>
      )
    }
  }

  return (
    <div className={cn("flex gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && isFirstInGroup && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender?.profilePicture} alt={sender?.fullName} className="object-cover" />
          <AvatarFallback>{sender?.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      {!isCurrentUser && !isFirstInGroup && <div className="w-8" />}

      <div className={cn("max-w-[60%] flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
        {isFirstInGroup && (
          <div className={cn("mb-1 text-xs", isCurrentUser ? "text-right" : "text-left")}>
            <span className="text-muted-foreground">{format(new Date(message.createdAt), 'h:mm a')}</span>
          </div>
        )}
        {renderMessage()}
      </div>
    </div>
  );
};

export default MessageItem;
