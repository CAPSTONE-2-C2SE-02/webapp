import { Loader2, MessageSquareMore, SendHorizonal } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
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
  postId: string;
}

const CommentPostModal = ({ postId }: CommentPostModalProps) => {
  const [comment, setComment] = useState("");
  const [isCommentModelOpen, setIsCommentPostModelOpen] = useState(false);
  const queryClient = useQueryClient();
  const auth = useAuthInfo();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
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

  const totalComments = () => {
    let count = 0;
    const stack = [...comments];
    while (stack.length > 0) {
      const comment = stack.pop();
      if (!comment) continue;
      count += 1;
      if (comment.childComments) stack.push(...comment.childComments);
    }
    return count;
  }

  return (
    <Dialog open={isCommentModelOpen} onOpenChange={setIsCommentPostModelOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          className="text-primary py-3 px-3.5 gap-4"
        >
          <div className="flex items-center gap-1.5">
            <MessageSquareMore className="size-5" />
            <span className="text-sm font-medium leading-none">
              Comments
            </span>
            <span className="text-sm py-1 px-1.5 rounded-xl bg-primary/20 text-primary leading-none">{totalComments()}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl p-5 max-h-[calc(100vh-48px)] h-auto overflow-hidden gap-4 pb-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-primary">
            Comments <span className="text-sm text-muted-foreground">({totalComments()})</span>
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
          <ScrollArea className="max-h-[calc(100vh-240px)] w-full">
            <div className="space-y-5 py-1">
              {comments.map((comment) => (
                <CommentCard comment={comment} key={comment._id} onAddReply={handleAddReply} level={1} />
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CommentPostModal