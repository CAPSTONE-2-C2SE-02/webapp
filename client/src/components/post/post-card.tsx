import { Link } from "react-router";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Bookmark,
  Clock,
  EllipsisVertical,
  Forward,
  Heart,
  MapPin,
  MessageSquareMore,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SharePostModal from "../modals/share-post-modal";

const PostCard = () => {
  const [isLike, setIsLike] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [isSharePostModelOpen, setIsSharePostModelOpen] = useState(false);
  const [postUrl, setPostUrl] = useState<string>("");

  const showSharePost = (postId: string) => {
    const baseUrl = window.location.origin || "http://localhost:5173";
    const shareUrl = `${baseUrl}/post/${postId}`;
    setIsSharePostModelOpen(true);
    setPostUrl(shareUrl);
  };

  const handleLikePost = () => {
    setIsLike((prev) => !prev);
  };

  const handleSavePost = () => {
    setIsSave((prev) => !prev);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden">
              <img
                src="https://images.unsplash.com/profile-1441298803695-accd94000cac?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=64&w=64&s=5a9dc749c43ce5bd60870b129a40902f"
                alt=""
                className="w-full h-full"
              />
            </div>
            <div className="text-primary">
              <Link
                to={`/users/username`}
                className="hover:underline text-sm font-medium"
              >
                Ngoc Anh
              </Link>
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <Link
                  to={`/users/username/posts/postId`}
                  className="text-xs hover:underline"
                >
                  12 minutes ago
                </Link>
              </div>
            </div>
          </div>
          <div className="text-primary">
            <Button variant={"ghost"} size={"icon"} onClick={handleSavePost} className="hover:text-primary">
              {isSave ? (
                <Bookmark className="size-4" fill="hsl(202, 80%, 24%)" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </Button>
            <Button variant={"ghost"} size={"icon"}>
              <EllipsisVertical />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {/* Text Content */}
          <div>
            <p className="text-black text-sm font-normal">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta
              ducimus quia, ipsam consequatur corrupti quasi quas minima, et
              cupiditate possimus provident quis hic eius unde est odio laborum.
              Officia, blanditiis.
            </p>
            {/* Hashtag */}
            <div className="flex items-center gap-1 mt-1">
              <Link
                to={`/posts&search=banahill`}
                className="hover:underline text-sm text-primary"
              >
                #banahill
              </Link>
              <Link
                to={`/posts&search=banahill`}
                className="hover:underline text-sm text-primary"
              >
                #banahill
              </Link>
              <Link
                to={`/posts&search=banahill`}
                className="hover:underline text-sm text-primary"
              >
                #banahill
              </Link>
            </div>
          </div>
          {/* Photos Content */}
          <div className="w-[618px] mt-3">
            <div className="overflow-y-hidden overflow-x-hidden w-[calc(100%+24px)]">
              <div className="flex flex-row gap-1 overflow-x-auto cursor-grab translate-x-0">
                <div className="min-w-60 h-auto rounded-lg border border-slate-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1741462434929-0ea63a52917c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-60 h-auto rounded-lg border border-slate-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1741462434929-0ea63a52917c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-60 h-auto rounded-lg border border-slate-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1741462434929-0ea63a52917c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-60 h-auto rounded-lg border border-slate-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1741462434929-0ea63a52917c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-60 h-auto rounded-lg border border-slate-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1741462434929-0ea63a52917c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-6 h-full flex-shrink-0" />
              </div>
            </div>
          </div>
          {/* Tour Attachment */}
          <Link to={`/tours/tourId?fromPost=true`} className="group">
            <div className="w-full p-2 rounded-3xl border border-slate-200 bg-slate-50 flex items-center gap-6 mt-2 group-hover:shadow">
              <div className="w-60 h-32 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1741462434929-0ea63a52917c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-primary">
                  Ha Giang Loop and Dong Van Kast Plateau Amazing 2 Days Car
                  Tour
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="size-4" />
                  <span className="text-sm">Ha Giang</span>
                </div>
                <p className="text-xs line-clamp-2 mt-1">
                  Explore the rural wonders of Cao Bang and Ha Giang. Explore
                  the most famous places in the North such as Ban Gioc
                  Waterfall, Nguom Ngao Cave, Nho Que River, Dong Van Stone
                  Plateau,...
                </p>
              </div>
            </div>
          </Link>
          {/* Post Action */}
          <div className="w-full flex items-center justify-between px-10 mt-3">
            <Button
              variant={"ghost"}
              className={cn(
                "py-3 px-3.5 gap-4",
                isLike ? "text-red-400 hover:text-red-400" : "text-primary"
              )}
              onClick={handleLikePost}
            >
              <div className="flex items-center gap-1.5">
                {isLike ? (
                  <Heart className="size-5" fill="oklch(0.704 0.191 22.216)" />
                ) : (
                  <Heart className="size-5" />
                )}
                <span className="text-sm font-medium leading-none">Like</span>
              </div>
              <div className="flex items-center justify-center py-1 px-1.5 rounded-xl bg-primary/20">
                <span className="text-sm font-semibold leading-none text-primary">
                  13
                </span>
              </div>
            </Button>
            <Button
              variant={"ghost"}
              className="text-primary py-3 px-3.5 gap-4"
            >
              <div className="flex items-center gap-1.5">
                <MessageSquareMore className="size-5" />
                <span className="text-sm font-medium leading-none">
                  Comment
                </span>
              </div>
              <div className="flex items-center justify-center py-1 px-1.5 rounded-xl bg-primary/20">
                <span className="text-sm font-semibold leading-none">13</span>
              </div>
            </Button>
            <Button
              variant={"ghost"}
              className="text-primary py-3 px-3.5 gap-4"
              onClick={() => showSharePost("postId")}
            >
              <div className="flex items-center gap-1.5">
                <Forward className="size-5" />
                <span className="text-sm font-medium leading-none">Share</span>
              </div>
              <div className="flex items-center justify-center py-1 px-1.5 rounded-xl bg-primary/20">
                <span className="text-sm font-semibold leading-none">13</span>
              </div>
            </Button>
          </div>
        </CardContent>
        {/* <CardFooter className="border-t border-slate-200"></CardFooter> */}
      </Card>

      {/* Share Modal */}
      <SharePostModal
        isOpen={isSharePostModelOpen}
        onOpenChange={setIsSharePostModelOpen}
        url={postUrl}
      />
    </>
  );
};

export default PostCard;
