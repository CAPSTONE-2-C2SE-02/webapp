import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect } from "react";

interface PostImagesLightboxProps {
  images: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onClose: () => void;
}

const PostImagesLightbox = ({
  images,
  currentIndex,
  setCurrentIndex,
  onClose,
}: PostImagesLightboxProps) => {
  // go to previous image
  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
  };

  // go to next image
  const goToNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
  };

  // keymap navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // prevent background from scrolling
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative h-full w-full" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-6 w-6 text-white" />
        </Button>

        {/* gallery */}
        <div className="flex items-center justify-center relative h-full w-full">
          <div className="max-h-[80vh] max-w-[60vw] h-full w-full rounded-md overflow-hidden">
            <div className="h-full w-full object-contain">
              <img src={images[currentIndex]} alt="image gallery" className="h-full mx-auto rounded-sm" />
            </div>
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="absolute left-4 z-10 h-12 w-12 rounded-full bg-slate-300"
                onClick={goToPrevious}
              >
                <ChevronLeft className="size-8 text-primary" />
              </Button>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="absolute right-4 z-10 h-12 w-12 rounded-full bg-slate-300"
                onClick={goToNext}
              >
                <ChevronRight className="size-8 text-primary" />
              </Button>
            </>
          )}
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-1 w-8 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

      </div>
    </div>
  )
}

export default PostImagesLightbox