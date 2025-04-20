import { Copy, Facebook, Linkedin, Twitter } from "lucide-react";
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton } from "react-share";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";

interface SharePostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

const SharePostModal = ({ isOpen, onOpenChange, url }: SharePostModalProps) => {
  const copyToClipboard = async () => {
    if (!url) return;

    try {
        await navigator.clipboard.writeText(url);
        toast.success("Post URL copied to clipboard");
    } catch (error) {
        console.error(error);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-5">
            <FacebookShareButton url={url}>
              <Button
                size={"icon"}
                variant={"outline"}
                className="rounded-full size-10"
              >
                  <Facebook className="size-8" />
              </Button>
            </FacebookShareButton>
            <LinkedinShareButton url={url}>
              <Button
                size={"icon"}
                variant={"outline"}
                className="rounded-full size-10"
              >
                  <Linkedin className="size-8" />
              </Button>
            </LinkedinShareButton>
            <TwitterShareButton url={url}>
              <Button
                size={"icon"}
                variant={"outline"}
                className="rounded-full size-10"
              >
                  <Twitter className="size-8" />
              </Button>
            </TwitterShareButton>
          </div>
          <div className="w-full">
            <p className="text-xs font-medium text-zinc-800 mb-2 text-left">
              Or copy link
            </p>
            <div className="flex items-center gap-2 w-full">
              <Input type="text" value={url} readOnly className="font-medium" />
              <Button
                type="button"
                variant="outline"
                className="flexs-shrink-0"
                onClick={copyToClipboard}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostModal;
