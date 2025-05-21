import { cn } from "@/lib/utils";
import { LinkIcon, TramFrontIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { getConversationMedia } from "@/services/messages/message-api";
import { Link } from "react-router";
import { useState } from "react";
import useLightBox from "@/hooks/useLightBox";
import ImagesLightbox from "../utils/images-lightbox";

interface ChatInformationProps {
  isShow: boolean;
  userId: string;
}

const ChatInformation = ({ isShow, userId }: ChatInformationProps) => {
  const [imagesAmount, setImagesAmount] = useState(3);
  const [toursAmount, setToursAmount] = useState(3);
  const { isLightboxOpen, currentImageIndex, setCurrentImageIndex, openLightbox, closeLightbox } = useLightBox();

  const { data: media, isLoading } = useQuery({
    queryKey: ["conversation-media", userId],
    queryFn: () => getConversationMedia(userId),
    enabled: isShow,
    refetchOnWindowFocus: false,
  });

  const tours = media?.tours || [];
  const images = media?.images || [];
  const links = media?.links || [];

  return (
    <>
      <div
        className={cn(
          "bg-white p-3 px-4 border border-border rounded-lg space-y-5",
          isShow ? "col-span-1" : "hidden"
        )}
      >
        {/* tour links */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-primary text-base font-medium">
            Attachments
          </div>
          <span className="text-muted-foreground text-xs block">Tour links</span>
          {isLoading ? (
            <div className="bg-muted text-muted-foreground text-sm text-center py-2">
              Loading...
            </div>
          ) : tours.length === 0 ? (
            <div className="bg-muted text-muted-foreground text-sm text-center py-2">
              No tour links found
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1 space-y-1">
                {tours.slice(0, toursAmount).map((tour) => (
                  <Link
                    key={tour._id}
                    to={`/tours/${tour._id}`}
                    target="_blank"
                    className="bg-muted p-2 flex gap-2 items-center rounded-sm"
                  >
                    <TramFrontIcon className="size-4 text-primary flex-shrink-0" />
                    <p className="line-clamp-1 text-xs text-slate-600">
                      {tour.title}
                    </p>
                  </Link>
                ))}
              </div>
              {toursAmount < tours.length && (
                <Button size={"sm"} variant={"outline"} className="w-full text-primary" onClick={() => setToursAmount(tours.length)}>
                  See All
                </Button>
              )}
            </>
          )}
          <span className="text-muted-foreground text-xs block">Links</span>
          {isLoading ? (
            <div className="bg-muted text-muted-foreground text-sm text-center py-2">
              Loading...
            </div>
          ) : links.length === 0 ? (
            <div className="bg-muted text-muted-foreground text-sm text-center py-2">
              No links found
            </div>
          ) : (
            <div className="flex flex-col gap-1 space-y-1">
              {links.map((link) => (
                <Link key={link} to={link} target="_blank" className="bg-muted p-2 flex gap-2 items-center rounded-sm">
                  <LinkIcon className="size-4 text-primary flex-shrink-0" />
                  <p className="line-clamp-1 text-xs text-slate-600">
                    {link}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* images */}
        <div className="space-y-3">
          <div className="flex items-center gap-1 text-primary text-base font-medium">
            Images
          </div>
          {isLoading ? (
            <div className="bg-muted text-muted-foreground text-sm text-center py-2">
              Loading...
            </div>
          ) : images.length === 0 ? (
            <div className="bg-muted text-muted-foreground text-sm text-center py-2">
              No images found
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {images.slice(0, imagesAmount).map((image, index) => (
                  <div
                    key={image}
                    className="bg-black aspect-square rounded-lg relative"
                  >
                    {index === 2 && imagesAmount === 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-base font-semibold rounded-lg">
                        +{images.length - 3}
                      </div>
                    )}
                    <img
                      src={image}
                      alt="attachment"
                      className="h-full w-full object-cover rounded-lg"
                      onClick={() => openLightbox(index)}
                    />
                  </div>
                ))}
              </div>
              {imagesAmount < images.length && (
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className="w-full text-primary"
                  onClick={() => setImagesAmount(images.length)}
                >
                  See All
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      {isLightboxOpen && (
        <ImagesLightbox
          images={images}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
          onClose={closeLightbox}
          type="image"
        />
      )}
    </>
  );
};

export default ChatInformation;
