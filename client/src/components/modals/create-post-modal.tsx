import { useEffect, useRef, useState } from "react";
import { Hash, Image, Loader2, MapPin, Smile, X } from "lucide-react";
import { Description } from "@radix-ui/react-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { TagsInput } from "../ui/tags-input";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import TourAttachment from "../tour/tour-attachment";
import TourAttachmentSelector from "../tour/tour-attachment-selector";
import { Tour } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { useCreatePostMutation } from "@/services/posts/post-api";
import { toast } from "sonner";

interface CreateNewPostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNewPostModal = ({
  isOpen,
  onOpenChange,
}: CreateNewPostModalProps) => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const [createPost, { isLoading, isError, error }] = useCreatePostMutation();

  const [isShowTagInput, setIsShowTagInput] = useState(false);
  const [showTourSelector, setShowTourSelector] = useState(false);

  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // reset all form fields when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsShowTagInput(false);
      setShowTourSelector(false);
      setTags([]);
      setContent("");
      setSelectedTour(null);
      setImages([]);
      if (contentRef.current) contentRef.current.innerHTML = "";
    }
  }, [isOpen]);

  // set content from div textbox
  const handleInput = () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText.trim();
      setContent(text);
    }
  }

  // handle tasks related to images 
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // create new post
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
  
      // Append text data
      if (content) {
        content.split('\n').forEach((line) => {
          formData.append('content', line);
        });
      }
      tags.forEach((tag) => {
        formData.append('hashtag', tag);
      });
      if (selectedTour) {
        formData.append('tourAttachment', selectedTour._id);
      }

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await createPost(formData).unwrap();

      if (!response.success || isError) {
        toast.error(response.error || error as string || "Error when creating post");
        return;
      }

      toast.success(response.message);
      onOpenChange(false);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.error || "Error when creating post");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl p-0 max-h-[calc(100vh-48px)] h-auto overflow-hidden">
        <div className="relative w-full h-full flex overflow-hidden">
          {/* create post view */}
          <div 
            className={cn(
              "w-full flex-shrink-0 flex flex-col gap-4 transition-transform duration-300 ease-in-out p-5",
              showTourSelector ? "-translate-x-full" : "translate-x-0"
            )}
          >
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-lg text-center text-primary">Create new post</DialogTitle>
              <Description className="text-center text-xs">Let's share your feelings!</Description>
            </DialogHeader>
            {/* Form */}
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-full overflow-hidden flex-shrink">
                <img
                  src={userInfo?.profilePicture || "https://ui-avatars.com/api/?size=128&background=random"}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full flex-1 space-y-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-semibold text-primary">{userInfo?.fullName}</span>
                  <Badge className="text-xs rounded-full">@{userInfo?.username}</Badge>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    {content.length == 0 && (
                      <span className="absolute top-0 left-0 text-gray-400 pointer-events-none text-sm">
                        What's on your mind?
                      </span>
                    )}
                    <div
                      aria-placeholder="What's on your mind?"
                      ref={contentRef}
                      tabIndex={0}
                      role="textbox"
                      contentEditable="true"
                      spellCheck="false"
                      onInput={handleInput}
                      className="w-full select-text break-words rounded focus:outline-none min-h-[1rem] text-sm whitespace-pre-wrap overflow-x-auto overflow-y-auto"
                    />
                  </div>
                  {isShowTagInput && (
                    <TagsInput
                      value={tags}
                      onValueChange={setTags}
                      placeholder="Enter hashtag"
                      className="w-full"
                    />
                  )}
                  {images.length > 0 && (
                    <Carousel className="w-full">
                      <CarouselContent className="flex">
                        {images.map((image, index) => (
                          <CarouselItem key={index} className="relative min-w-[200px] h-[200px] basis-auto select-none first:pl-4 pl-2">
                            <div className="overflow-hidden w-full h-full rounded-lg border border-zinc-300">
                              <img 
                                className="w-full h-full object-cover" 
                                src={URL.createObjectURL(image)} 
                                alt={`Upload ${index + 1}`} 
                              />
                            </div>
                            <button 
                              className="absolute top-2 right-2 bg-black/30 rounded-full p-1"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  )}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {selectedTour && (
                    <TourAttachment tour={selectedTour} onRemove={() => setSelectedTour(null)} />
                  )}
                </div>
                <div className="inline-flex items-center gap-0 text-primary">
                  <Button size={"icon"} variant={"ghost"} onClick={() => fileInputRef.current?.click()}>
                    <Image className="size-5" />
                  </Button>
                  <Button size={"icon"} variant={"ghost"} onClick={() => setIsShowTagInput(prev => !prev)}>
                    <Hash className="size-5" />
                  </Button>
                  <Button size={"icon"} variant={"ghost"} onClick={() => setShowTourSelector(true)}>
                    <MapPin className="size-5" />
                  </Button>
                  <Button size={"icon"} variant={"ghost"}>
                    <Smile className="size-5" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Action */}
            <DialogFooter className="w-full flex items-center sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Post
              </Button>
            </DialogFooter>
          </div>

          {/* tour selector */}
          <div
            className={cn(
              "w-full p-5 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out",
              showTourSelector ? "-translate-x-full" : "translate-x-0"
            )}
          >
            <TourAttachmentSelector
              isShow={showTourSelector}
              onBack={() => setShowTourSelector(false)}
              onSelect={(tour) => setSelectedTour(tour)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewPostModal;
