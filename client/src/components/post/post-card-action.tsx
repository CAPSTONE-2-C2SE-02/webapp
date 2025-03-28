import { EllipsisVertical, Flag, Loader2, Share2, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useAppSelector } from "@/hooks/redux";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { useDeletePostMutation } from "@/services/posts/mutation";

interface PostCardActionProps {
  id: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  }
}

const PostCardAction = ({ id, author }: PostCardActionProps) => {
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const mutation = useDeletePostMutation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={"ghost"} size={"icon"}>
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem className="justify-between font-medium">
            Share
            <Share2 className="size-4 text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-between font-medium">
            Report
            <Flag className="size-4 text-muted-foreground font-medium" />
          </DropdownMenuItem>
          {isAuthenticated && userInfo?.username === author.username && (
            <DropdownMenuItem 
              className="justify-between font-medium"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
              <Trash className="size-4 text-red-500" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteDialog} onOpenChange={() => setShowDeleteDialog(true)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => mutation.mutate(id, { onSuccess: () => setShowDeleteDialog(false) })}
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="animate-spin size-4" />}
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PostCardAction