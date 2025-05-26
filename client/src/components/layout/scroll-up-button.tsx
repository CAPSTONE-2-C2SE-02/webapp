import { useEffect, useState } from "react"
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollUpButton = ({ threshold = 560 }: { threshold?: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY >= threshold);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      size={"icon"}
      variant={"outline"}
      className={cn("fixed right-8 bottom-32 w-10 h-10 rounded-full transition-opacity duration-300", isVisible ? "opacity-100 visible" : "opacity-0 invisible")}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-4" />
    </Button>
  )
}

export default ScrollUpButton