import { Comment } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { CornerDownRight, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useAppSelector } from "@/hooks/redux";

interface CommentProps {
  comment: Comment;
  onAddReply: (parentId: string, content: string) => void;
}

const CommentCard = ({ comment, onAddReply }: CommentProps) => {
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyComment, setReplyComment] = useState<string>("");
  const inputReplyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isReplying && inputReplyRef.current) {
      inputReplyRef.current.focus();
    }
  }
  , [isReplying]);

  const handleReplyCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyComment(e.target.value);
  };

  const handleReplySubmit = () => {
    if (replyComment.trim() === "") return;
    onAddReply(comment._id, replyComment);
    setReplyComment("");
    setIsReplying(false);
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleReplySubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* parent comment */}
      <div className="flex items-start gap-4 bg-slate-100 py-2 px-3 rounded-lg">
        <Avatar className="w-10 h-10 border">
          <AvatarImage
            src={comment.author.profilePicture}
            alt={comment.author.fullName}
          />
          <AvatarFallback>{comment.author.fullName}</AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Link
              to={`/${comment.author.username}`}
              className="font-semibold text-primary"
            >
              {comment.author.fullName}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="mb-1">{comment.content}</p>
          {/* comment action */}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <Button variant={"outline"} size={"sm"} className="h-7 px-2" onClick={() => { setIsReplying(!isReplying); inputReplyRef.current?.focus(); }}>
                <CornerDownRight /> Reply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* children comment */}
      {comment.childComments && comment.childComments.length > 0 && (
        <div className="ml-8 pl-5 border-l-2 rounded-l-sm border-gray-200 space-y-3">
          {comment.childComments.map((replyComment) => (
            <CommentCard
              comment={replyComment}
              key={replyComment._id}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}

      {/* reply comment input */}
      {isAuthenticated && isReplying && (
        <div className="relative flex items-center justify-start gap-3 pr-2 ml-8">
          <Avatar className="border w-9 h-9">
            <AvatarImage src={userInfo?.profilePicture} alt="avatar" />
            <AvatarFallback>{userInfo?.fullName}</AvatarFallback>
          </Avatar>
          <Input
            className="rounded-full h-9 pl-4"
            type="text"
            placeholder="Add comment..."
            onChange={handleReplyCommentChange}
            onKeyDown={handleReplyKeyDown}
            ref={inputReplyRef}
            value={replyComment}
          />
          <Button
            className="absolute right-2 rounded-full top-1/2 -translate-y-1/2"
            size={"sm"}
            variant={"ghost"}
            onClick={handleReplySubmit}
            disabled={replyComment.trim() === ""}
          >
            <SendHorizonal />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentCard;
