import { EllipsisVertical, Flag, Loader2, Pencil, Share2, Trash, Image } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useAppSelector } from "@/hooks/redux";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { useDeletePostMutation } from "@/services/posts/mutation";
import { Post } from "@/lib/types";
import CreatePostModal from "../modals/create-post-modal";

interface PostCardActionProps {
  postData: Post;
  onCopyToImage?: () => void;
}

const PostCardAction = ({ postData, onCopyToImage }: PostCardActionProps) => {
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const mutation = useDeletePostMutation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} size={"icon"}>
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem className="justify-between font-medium">
            Share
            <Share2 className="size-4 text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="justify-between font-medium"
            onClick={onCopyToImage}
          >
            Copy to image
            <Image className="size-4 text-muted-foreground" />
          </DropdownMenuItem>
          {isAuthenticated && userInfo?.username === postData.createdBy.username && (
            <DropdownMenuItem 
              className="justify-between font-medium"
              onClick={() => setShowEditModal(true)}
            >
              Edit
              <Pencil className="size-4 text-muted-foreground" />
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isAuthenticated && userInfo?.username !== postData.createdBy.username && (
            <DropdownMenuItem className="justify-between font-medium">
              Report
              <Flag className="size-4 text-muted-foreground font-medium" />
            </DropdownMenuItem>
          )}
          {isAuthenticated && userInfo?.username === postData.createdBy.username && (
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              onClick={() => mutation.mutate(postData._id, { onSuccess: () => setShowDeleteDialog(false) })}
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
      <CreatePostModal 
        isOpen={showEditModal}
        onOpenChange={setShowEditModal}
        postData={postData}
        mode="update"
      />
    </>
  )
}

export default PostCardAction