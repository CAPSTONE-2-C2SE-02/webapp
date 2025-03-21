import { useEffect, useMemo, useState } from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "../ui/carousel";
import { cn } from "@/lib/utils";

interface TourImageGalleryProps {
  images: string[];
}

const TourImageGallery = ({ images }: TourImageGalleryProps) => {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const mainImage = useMemo(
    () => (
      images.map((image, index) => (
        <CarouselItem key={index} className="relative w-full aspect-video rounded-lg">
          <img
            src={image}
            alt={`Main Image ${index + 1}`}
            className="object-cover w-full h-full rounded-lg"
          />
        </CarouselItem>
      ))
    ),
    [images],
  );

  const thumbnailImages = useMemo(
    () => (
      images.map((image, index) => (
        <CarouselItem key={index} className="basis-1/4 relative aspect-video w-full" onClick={() => handleClick(index)}>
          <img
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className={cn(
              "object-cover w-full h-full rounded-lg",
              index === current ? "border-2 border-primary" : "",
            )}
          />
        </CarouselItem>
      ))
    ),
    [images, current],
  );

  useEffect(() => {
    if (!mainApi || !thumbnailApi) {
      return;
    }

    const handleTopSelect = () => {
      const selected = mainApi.selectedScrollSnap();
      setCurrent(selected);
      thumbnailApi.scrollTo(selected);
    };

    const handleBottomSelect = () => {
      const selected = thumbnailApi.selectedScrollSnap();
      setCurrent(selected);
      mainApi.scrollTo(selected);
    };

    mainApi.on("select", handleTopSelect);
    thumbnailApi.on("select", handleBottomSelect);

    return () => {
      mainApi.off("select", handleTopSelect);
      thumbnailApi.off("select", handleBottomSelect);
    };
  }, [mainApi, thumbnailApi]);

  const handleClick = (index: number) => {
    if (!mainApi || !thumbnailApi) {
      return;
    }
    thumbnailApi.scrollTo(index);
    mainApi.scrollTo(index);
    setCurrent(index);
  }

  return (
    <div className="mb-4">
      <Carousel setApi={setMainApi}>
        <CarouselContent>{mainImage}</CarouselContent>
      </Carousel>
      <Carousel setApi={setThumbnailApi} className="mt-4">
        <CarouselContent>{thumbnailImages}</CarouselContent>
      </Carousel>
    </div>
  )
}

export default TourImageGallery;