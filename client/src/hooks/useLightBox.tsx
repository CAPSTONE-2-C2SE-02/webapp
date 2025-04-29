import { useState } from "react";

export default function useLightBox() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  return {
    isLightboxOpen,
    setIsLightboxOpen,
    currentImageIndex,
    setCurrentImageIndex,
    openLightbox,
    closeLightbox,
  };
}
