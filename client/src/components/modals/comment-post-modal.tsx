import { Loader2, SendHorizonal } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Input } from "../ui/input"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createComment, getCommentsByPostId } from "@/services/comments/comment-api"
import { ScrollArea } from "../ui/scroll-area"
import CommentCard from "../comment/comment"
import { Comment } from "@/lib/types"
import useAuthInfo from "@/hooks/useAuth"
import { useAppSelector } from "@/hooks/redux"

interface CommentPostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

const CommentPostModal = ({ isOpen, onOpenChange, postId }: CommentPostModalProps) => {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const auth = useAuthInfo();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId && isOpen,
    refetchOnWindowFocus: false,
  });

  // mutation to create a comment
  const mutation = useMutation({
    mutationFn: (newComment: { postId: string; content: string; parentId?: string }) =>
      createComment(newComment.postId, newComment.content, newComment.parentId),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData<Comment[]>(["comments", postId]);

      const optimicisticUpdate: Comment = {
        ...newComment,
        _id: Date.now().toString(),
        author: {
          _id: auth?._id || '',
          fullName: auth?.fullName || '',
          username: auth?.username || '',
          profilePicture: auth?.profilePicture || '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        childComments: [],
        likes: [],
      };

      queryClient.setQueryData<Comment[]>(["comments", postId], (oldComments) => {
        if (!oldComments) return oldComments;

        if (newComment.parentId) {
          return oldComments.map((comment) => {
            if (comment._id === newComment.parentId) {
              return {
                ...comment,
                childComments: [...(comment.childComments ?? []), optimicisticUpdate]
              }
            }
            return comment;
          })
        }

        return [
          ...oldComments,
          optimicisticUpdate,
        ]
      });

      return { previousComments };
    },
    onError: (_error, _newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData<Comment[]>(["comments", postId], context.previousComments);
      }
    },
    onSettled: () => {
      // Refetch after mutation settles (success or error)
      queryClient.invalidateQueries({ queryKey: ["comments", postId]});
      setComment("");
    },
  });

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const handleAddComment = () => {
    if (comment.trim() === "") return;
    mutation.mutate({ postId, content: comment });
    setComment("");
  };

  const handleAddReply = (parentId: string, content: string) => {
    mutation.mutate({ postId, content, parentId });
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleAddComment();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl p-5 max-h-[calc(100vh-48px)] h-auto overflow-hidden gap-4 pb-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-primary">
            Comments
          </DialogTitle>
          <DialogDescription className="sr-only">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
          {/* comment input on post */}
          {isAuthenticated && (
            <div className="relative flex items-center justify-start gap-3">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src={auth?.profilePicture} alt="avatar" />
                <AvatarFallback>{auth?.fullName}</AvatarFallback>
              </Avatar>
              <Input
                className="rounded-full h-10 pl-4"
                type="text"
                placeholder="Add comment..."
                value={comment}
                onChange={handleCommentChange}
                onKeyDown={handleCommentKeyDown}
              />
              <Button
                className="absolute right-2 rounded-full top-1/2 -translate-y-1/2"
                size={"sm"}
                variant={"ghost"}
                onClick={handleAddComment}
                disabled={mutation.isPending}
              >
                <SendHorizonal />
              </Button>
            </div>
          )}
        </DialogHeader>

        {isLoading && (
          <div className="bg-slate-100 py-5 px-4 rounded-xl">
            <Loader2 className="animate-spin mx-auto" />
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <div className="bg-slate-100 py-5 px-4 rounded-xl">
            <p className="text-center text-sm text-muted-foreground">No comments yet</p>
          </div>
        )}

        {!isLoading && comments.length > 0 && (
          <ScrollArea className="max-h-[calc(100vh-240px)] w-full pr-2">
            <div className="space-y-5 py-1">
              {comments.map((comment) => (
                <CommentCard comment={comment} key={comment._id} onAddReply={handleAddReply} />
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CommentPostModal