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
import { Post, TourAttachment as TourPostType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreatePostMutation, useUpdatePostMutation } from "@/services/posts/mutation";
import useAuthInfo from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { EmojiPicker, EmojiPickerContent, EmojiPickerSearch } from "../ui/emoji-picker";
import { useAppDispatch } from "@/hooks/redux";
import { setInformation } from "@/stores/slices/auth-slice";

// Types
interface PostFormData {
  content: string;
  tags: string[];
  selectedTour: TourPostType | null;
  images: File[];
  existingImages: string[];
  removedImages: string[];
}

interface CreatePostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postData?: Post;
  mode?: 'create' | 'update';
}

// Image Carousel Component
const ImageCarousel = ({ 
  existingImages, 
  images, 
  onRemoveImage 
}: { 
  existingImages: string[]; 
  images: File[]; 
  onRemoveImage: (index: number, isExisting: boolean) => void;
}) => {
  if (images.length === 0 && existingImages.length === 0) return null;

  return (
    <Carousel className="w-full max-w-[584px]">
      <CarouselContent className="flex">
        {existingImages.map((imageUrl, index) => (
          <CarouselItem key={`existing-${index}`} className="relative min-w-[200px] h-[200px] basis-auto select-none first:pl-4 pl-2">
            <div className="overflow-hidden w-full h-full rounded-lg border border-zinc-300">
              <img 
                className="w-full h-full object-cover" 
                src={imageUrl} 
                alt={`Existing ${index + 1}`} 
              />
            </div>
            <button 
              className="absolute top-2 right-2 bg-black/30 rounded-full p-1"
              onClick={() => onRemoveImage(index, true)}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </CarouselItem>
        ))}
        {images.map((image, index) => (
          <CarouselItem key={`new-${index}`} className="relative min-w-[200px] h-[200px] basis-auto select-none first:pl-4 pl-2">
            <div className="overflow-hidden w-full h-full rounded-lg border border-zinc-300">
              <img 
                className="w-full h-full object-cover" 
                src={URL.createObjectURL(image)} 
                alt={`Upload ${index + 1}`} 
              />
            </div>
            <button 
              className="absolute top-2 right-2 bg-black/30 rounded-full p-1"
              onClick={() => onRemoveImage(index, false)}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

const CreatePostModal = ({
  isOpen,
  onOpenChange,
  postData,
  mode = 'create'
}: CreatePostModalProps) => {
  const auth = useAuthInfo();
  const dispatch = useAppDispatch();
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  
  const [formData, setFormData] = useState<PostFormData>({
    content: "",
    tags: [],
    selectedTour: null,
    images: [],
    existingImages: [],
    removedImages: []
  });

  const [isShowTagInput, setIsShowTagInput] = useState(false);
  const [showTourSelector, setShowTourSelector] = useState(false);
  const [isOpenEmoji, setIsOpenEmoji] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize form with post data if in update mode
  useEffect(() => {
    if (mode === 'update' && postData && isOpen) {
      const initialFormData = {
        content: postData.content.join('\n'),
        tags: postData.hashtag || [],
        selectedTour: postData.tourAttachment || null,
        images: [],
        existingImages: postData.imageUrls || [],
        removedImages: []
      };
      
      setFormData(initialFormData);
      
      const timerId = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.innerText = initialFormData.content;
        }
      }, 0);
      
      if (postData.hashtag && postData.hashtag.length > 0) {
        setIsShowTagInput(true);
      }

      return () => clearTimeout(timerId);
    }
  }, [isOpen, mode, postData]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      const emptyFormData = {
        content: "",
        tags: [],
        selectedTour: null,
        images: [],
        existingImages: [],
        removedImages: []
      };
      setFormData(emptyFormData);
      setIsShowTagInput(false);
      setShowTourSelector(false);
      if (contentRef.current) contentRef.current.innerText = "";
    }
  }, [isOpen]);

  const handleInput = () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText.trim();
      setFormData(prev => ({ ...prev, content: text }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageToRemove = formData.existingImages[index];
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
        removedImages: [...prev.removedImages, imageToRemove]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSubmit = new FormData();
  
      if (formData.content) {
        const contentLines = formData.content.split('\n').filter(line => line.trim());
        contentLines.forEach((line) => {
          formDataToSubmit.append('content', line);
        });
      }
      
      formData.tags.forEach((tag) => {
        formDataToSubmit.append('hashtag', tag);
      });
      
      // handle tour attachment for both create and update modes
      if (mode === 'update') {
        // for update mode, always send tourAttachment field
        formDataToSubmit.append('tourAttachment', formData.selectedTour?._id || '');
      } else if (formData.selectedTour?._id) {
        // for create mode, only send if there's a selected tour
        formDataToSubmit.append('tourAttachment', formData.selectedTour._id);
      }

      formData.images.forEach((image) => {
        formDataToSubmit.append('images', image);
      });

      if (mode === "update") {
        formData.existingImages.forEach((imageUrl) => {
          formDataToSubmit.append('existingImages', imageUrl);
        });
        
        formData.removedImages.forEach((imageUrl) => {
          formDataToSubmit.append('removedImages', imageUrl);
        });
      }

      if (mode === 'create') {
        createPostMutation.mutate(
          formDataToSubmit,
          {
            onSuccess: () => {
              // Update the user's post count
              if (auth?.countPosts !== undefined) {
                dispatch(setInformation({ countPosts: auth.countPosts + 1 }));
              }
              onOpenChange(false);
            },
          }
        );
      } else if (mode === 'update' && postData) {
        updatePostMutation.mutate(
          { postId: postData._id, formData: formDataToSubmit },
          {
            onSuccess: () => {
              onOpenChange(false);
              toast.success('Post updated successfully');
            },
          }
        );
      }
    } catch (error: unknown) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage || `Error when ${mode === 'create' ? 'creating' : 'updating'} post`);
    }
  };

  const isSubmitting = createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl p-0 max-h-[calc(100vh-48px)] h-auto overflow-hidden">
        <div className="relative w-full h-full flex overflow-hidden">
          {/* Create post view */}
          <div 
            className={cn(
              "w-full flex-shrink-0 flex flex-col gap-4 transition-transform duration-300 ease-in-out p-5",
              showTourSelector ? "-translate-x-full" : "translate-x-0"
            )}
          >
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-lg text-center text-primary">
                {mode === 'create' ? 'Create new post' : 'Edit post'}
              </DialogTitle>
              <Description className="text-center text-xs">Let's share your feelings!</Description>
            </DialogHeader>

            {/* Form */}
            <div className="flex items-start gap-3 w-full">
              <div className="size-9 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={auth?.profilePicture || "https://ui-avatars.com/api/?size=128&background=random"}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-semibold text-primary">{auth?.fullName}</span>
                  <Badge className="text-xs rounded-full">@{auth?.username}</Badge>
                </div>
                <div className="space-y-3 p-1 overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
                  <div className="relative">
                    {formData.content.length === 0 && (
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
                      className="w-full select-text break-words rounded focus:outline-none min-h-[1rem] text-sm whitespace-pre-wrap"
                    />
                  </div>

                  {isShowTagInput && (
                    <TagsInput
                      value={formData.tags}
                      onValueChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                      placeholder="Enter hashtag"
                      className="w-full"
                    />
                  )}

                  <ImageCarousel
                    existingImages={formData.existingImages}
                    images={formData.images}
                    onRemoveImage={handleRemoveImage}
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  {formData.selectedTour && (
                    <TourAttachment 
                      tour={formData.selectedTour} 
                      onRemove={() => setFormData(prev => ({ ...prev, selectedTour: null }))} 
                    />
                  )}
                </div>

                <div className="inline-flex items-center gap-0 text-primary">
                  <Button size={"icon"} variant={"ghost"} onClick={() => fileInputRef.current?.click()}>
                    <Image className="size-5" />
                  </Button>
                  <Button size={"icon"} variant={"ghost"} onClick={() => setIsShowTagInput(prev => !prev)}>
                    <Hash className="size-5" />
                  </Button>
                  {auth?.role === "TOUR_GUIDE" && (
                    <Button size={"icon"} variant={"ghost"} onClick={() => setShowTourSelector(true)}>
                      <MapPin className="size-5" />
                    </Button>
                  )}

                  <Popover open={isOpenEmoji} onOpenChange={setIsOpenEmoji}>
                    <PopoverTrigger asChild>
                      <Button size={"icon"} variant={"ghost"}>
                        <Smile className="size-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto" asChild>
                      <EmojiPicker
                        className="h-[326px] rounded-lg border shadow-md"
                        onEmojiSelect={({ emoji }) => {
                          if (contentRef.current) {
                            contentRef.current.innerText += emoji;
                          }
                          handleInput();
                          setIsOpenEmoji(false);
                        }}                
                      >
                        <EmojiPickerSearch />
                        <EmojiPickerContent />
                      </EmojiPicker>
                    </PopoverContent>
                  </Popover>
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
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {mode === 'create' ? 'Post' : 'Update'}
              </Button>
            </DialogFooter>
          </div>

          {/* Tour selector */}
          <div
            className={cn(
              "w-full p-5 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out",
              showTourSelector ? "-translate-x-full" : "translate-x-0"
            )}
          >
            <TourAttachmentSelector
              isShow={showTourSelector}
              onBack={() => setShowTourSelector(false)}
              onSelect={(tour) => setFormData(prev => ({ ...prev, selectedTour: tour }))}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
