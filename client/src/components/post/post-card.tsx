import { Link } from "react-router";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Clock,
  Forward,
  Heart,
} from "lucide-react";
import { Button } from "../ui/button";
import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import SharePostModal from "../modals/share-post-modal";
import TourAttachment from "../tour/tour-attachment";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { Post } from "@/lib/types";
import PostCardAction from "./post-card-action";
import useAuthInfo from "@/hooks/useAuth";
import { useLikePostMutation } from "@/services/posts/mutation";
import CommentPostModal from "../modals/comment-post-modal";
import ImagesLightbox from "../utils/images-lightbox";
import useLightBox from "@/hooks/useLightBox";
import BookMarkButton from "@/components/utils/book-mark-button";
import HoverUserCard from "../user/hover-user-card";
import { formatPostDate } from "../utils/convert";
import { convertPostToImage } from "@/lib/post-to-image";

const PostCard = ({ postData }: { postData: Post }) => {
  const auth = useAuthInfo();
  const likePostMutation = useLikePostMutation();
  const cardRef = useRef<HTMLDivElement>(null);

  const { isLightboxOpen, setIsLightboxOpen, currentImageIndex, setCurrentImageIndex, openLightbox, closeLightbox } = useLightBox();
  const [isSharePostModelOpen, setIsSharePostModelOpen] = useState(false);
  const [postUrl, setPostUrl] = useState<string>("");

  const showSharePost = (postId: string) => {
    const baseUrl = window.location.origin || "http://localhost:5173";
    const shareUrl = `${baseUrl}/${postData.createdBy.username}/post/${postId}`;
    setIsSharePostModelOpen(true);
    setPostUrl(shareUrl);
  };

  const isLiked = postData.likes.some((like) => like._id === auth?._id);
  const likeCount = postData.likes.length;

  const handleLikePost = () => {
    likePostMutation.mutate(postData._id);
  };

  const handleCopyToImage = async () => {
    if (cardRef.current) {
      await convertPostToImage(cardRef.current);
    }
  };

  const postImages = useMemo(
    () => (
      postData?.imageUrls && postData?.imageUrls.map((image, index) => (
        <CarouselItem key={index} className="basis-auto max-h-[260px] max-w-[380px] first:pl-4 pl-2" onClick={() => openLightbox(index)}>
          <div className="overflow-hidden w-full h-full rounded-lg border border-zinc-300">
            <img src={image} alt="post image" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </CarouselItem>
      ))
    ),
    [postData?.imageUrls]
  );

  return (
    <>
      <Card className="overflow-hidden shadow-sm" ref={cardRef}>
        <CardHeader className="flex-row items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden">
              <img
                src={postData.createdBy.profilePicture}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-primary">
              <HoverUserCard user={postData?.createdBy} />
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <Link
                  to={`/${postData?.createdBy?.username}/post/${postData?._id}`}
                  className="text-xs hover:underline"
                >
                  {formatPostDate(new Date(postData?.createdAt))}
                </Link>
              </div>
            </div>
          </div>
          <div className="text-primary">
            <BookMarkButton
              itemId={postData._id}
              itemType="post"
              initialState={{
                isBookmarkedByUser: postData.bookmarks.some(bookmark => bookmark.user === auth?._id),
              }}
            />
            <PostCardAction postData={postData} onCopyToImage={handleCopyToImage} />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-3">
          {/* Text Content */}
          {(postData?.content || postData?.hashtag) && (
            <div>
              {postData?.content.length > 0 && postData.content.map((content, index) => {
                // convert if content is link, add <a> tag
                if (content.includes("http")) {
                  return (
                    <Link to={content} target="_blank" rel="noopener noreferrer" key={`${content}+${index}`} className="text-teal-600 text-sm hover:underline break-all line-clamp-2">{content}</Link>
                  )
                }
                return (
                  <p key={`${content}+${index}`} className="text-black text-sm font-normal">{content}</p>
                )
              })}
              {/* Hashtag */}
              <div className="flex items-center gap-1 mt-1">
                {postData?.hashtag?.length > 0 && postData.hashtag.map(tag => (
                  <Link
                    to={`/hashtag/${tag}`}
                    className="hover:underline text-sm text-primary"
                    key={tag}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Photos Content */}
          {postData?.imageUrls.length > 0 && (
            <div>
              {postData?.imageUrls.length === 1 ? (
                <div className="max-w-full overflow-hidden w-full h-full rounded-lg border border-zinc-300" onClick={() => setIsLightboxOpen(true)}>
                  <img src={postData?.imageUrls[0]} alt="" className="max-h-[420px] w-full object-cover" />
                </div>
              ) : (
                <div>
                  <Carousel>
                    <CarouselContent>{postImages}</CarouselContent>
                  </Carousel>
                </div>
              )}
            </div>
          )}
          {/* Tour Attachment */}
          {postData?.tourAttachment && (
            <TourAttachment tour={postData?.tourAttachment} />
          )}
          {/* Post Action */}
          <div className="w-full flex items-center justify-between px-10 rounded-md">
            <Button
              variant={"ghost"}
              className={cn(
                "py-3 px-3.5 gap-4",
                isLiked ? "text-red-400 hover:text-red-400" : "text-primary"
              )}
              onClick={handleLikePost}
            >
              <div className="flex items-center gap-1.5">
                {isLiked ? (
                  <Heart className="size-5" fill="oklch(0.704 0.191 22.216)" />
                ) : (
                  <Heart className="size-5" />
                )}
                <span className="text-sm font-medium leading-none">Like</span>
              </div>
              <div className={cn(
                "flex items-center justify-center py-1 px-1.5 rounded-xl",
                isLiked ? "text-red-400 hover:text-red-400 bg-red-500/20" : "text-primary bg-primary/20"
              )}>
                <span className="text-sm font-semibold leading-none">
                  {likeCount}
                </span>
              </div>
            </Button>
            {/* Commend Modal */}
            <CommentPostModal postId={postData._id} />
            <Button
              variant={"ghost"}
              className="text-primary py-3 px-3.5 gap-4"
              onClick={() => showSharePost(postData._id)}
            >
              <div className="flex items-center gap-1.5">
                <Forward className="size-5" />
                <span className="text-sm font-medium leading-none">Share</span>
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
      
      {isLightboxOpen && (
        <ImagesLightbox
          images={postData.imageUrls}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
};

export default PostCard;
